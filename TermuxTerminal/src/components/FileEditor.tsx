import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import RNFS from 'react-native-fs';

interface FileEditorProps {
  visible: boolean;
  filePath: string | null;
  onClose: () => void;
  onSave?: (path: string, content: string) => void;
}

const FileEditor: React.FC<FileEditorProps> = ({
  visible,
  filePath,
  onClose,
  onSave,
}) => {
  const [content, setContent] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [modified, setModified] = useState(false);
  const [lineCount, setLineCount] = useState(1);

  useEffect(() => {
    if (visible && filePath) {
      loadFile(filePath);
    } else {
      // Reset state when closed
      setContent('');
      setOriginalContent('');
      setModified(false);
    }
  }, [visible, filePath]);

  useEffect(() => {
    // Update modified status
    setModified(content !== originalContent);
    // Update line count
    setLineCount(content.split('\n').length);
  }, [content, originalContent]);

  const loadFile = async (path: string) => {
    setLoading(true);
    try {
      const fileContent = await RNFS.readFile(path, 'utf8');
      setContent(fileContent);
      setOriginalContent(fileContent);
      setModified(false);
    } catch (error) {
      Alert.alert('Error', `Failed to read file: ${error}`);
      onClose();
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!filePath) return;

    setSaving(true);
    try {
      await RNFS.writeFile(filePath, content, 'utf8');
      setOriginalContent(content);
      setModified(false);
      Alert.alert('Success', 'File saved successfully');
      if (onSave) {
        onSave(filePath, content);
      }
    } catch (error) {
      Alert.alert('Error', `Failed to save file: ${error}`);
    }
    setSaving(false);
  };

  const handleClose = () => {
    if (modified) {
      Alert.alert(
        'Unsaved Changes',
        'You have unsaved changes. Do you want to save before closing?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: "Don't Save",
            style: 'destructive',
            onPress: onClose,
          },
          {
            text: 'Save',
            onPress: async () => {
              await handleSave();
              onClose();
            },
          },
        ],
      );
    } else {
      onClose();
    }
  };

  const getFileName = () => {
    if (!filePath) return '';
    return filePath.split('/').pop() || '';
  };

  const formatFileSize = (text: string): string => {
    const bytes = new Blob([text]).size;
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.fileName}>{getFileName()}</Text>
            {modified && <Text style={styles.modifiedIndicator}>●</Text>}
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={[styles.button, styles.saveButton, saving && styles.buttonDisabled]}
              onPress={handleSave}
              disabled={!modified || saving}>
              <Text style={styles.buttonText}>
                {saving ? 'Saving...' : 'Save'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.closeButton]}
              onPress={handleClose}>
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* File Info Bar */}
        <View style={styles.infoBar}>
          <Text style={styles.infoText}>Lines: {lineCount}</Text>
          <Text style={styles.infoText}>Size: {formatFileSize(content)}</Text>
          <Text style={styles.infoText}>
            {modified ? 'Modified' : 'Saved'}
          </Text>
        </View>

        {/* Editor */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4ecdc4" />
            <Text style={styles.loadingText}>Loading file...</Text>
          </View>
        ) : (
          <View style={styles.editorContainer}>
            <ScrollView
              style={styles.lineNumbers}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}>
              {Array.from({length: lineCount}, (_, i) => (
                <Text key={i} style={styles.lineNumber}>
                  {i + 1}
                </Text>
              ))}
            </ScrollView>
            <TextInput
              style={styles.editor}
              value={content}
              onChangeText={setContent}
              multiline
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="Start typing..."
              placeholderTextColor="#666"
              textAlignVertical="top"
            />
          </View>
        )}

        {/* Bottom Toolbar */}
        <View style={styles.toolbar}>
          <Text style={styles.toolbarText}>{filePath || ''}</Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e1e1e',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#2a2a2a',
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  fileName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  modifiedIndicator: {
    color: '#ff6b6b',
    fontSize: 20,
    marginTop: -4,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 5,
  },
  saveButton: {
    backgroundColor: '#4ecdc4',
  },
  closeButton: {
    backgroundColor: '#555',
  },
  buttonDisabled: {
    backgroundColor: '#333',
    opacity: 0.5,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  infoBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#252525',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  infoText: {
    color: '#888',
    fontSize: 12,
    fontFamily: 'monospace',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 16,
    marginTop: 12,
  },
  editorContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  lineNumbers: {
    backgroundColor: '#252525',
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderRightWidth: 1,
    borderRightColor: '#444',
  },
  lineNumber: {
    color: '#666',
    fontSize: 14,
    fontFamily: 'monospace',
    lineHeight: 20,
    textAlign: 'right',
    minWidth: 40,
  },
  editor: {
    flex: 1,
    padding: 12,
    color: '#ffffff',
    fontSize: 14,
    fontFamily: 'monospace',
    lineHeight: 20,
  },
  toolbar: {
    padding: 8,
    backgroundColor: '#2a2a2a',
    borderTopWidth: 1,
    borderTopColor: '#444',
  },
  toolbarText: {
    color: '#888',
    fontSize: 11,
    fontFamily: 'monospace',
  },
});

export default FileEditor;
