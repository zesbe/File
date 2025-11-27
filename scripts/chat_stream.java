import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Scanner;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class chat_stream {
    public static void main(String[] args) throws Exception {
        Scanner sc = new Scanner(System.in);
        String apiKey = System.getenv("ZAI_API_KEY");
        if (apiKey == null || apiKey.isBlank()) {
            System.err.println("API key tidak ditemukan! export ZAI_API_KEY dulu.");
            System.exit(1);
        }

        HttpClient client = HttpClient.newBuilder()
                .version(HttpClient.Version.HTTP_2) // prefer HTTP/2
                .connectTimeout(Duration.ofSeconds(10))
                .build();

        String endpoint = "https://api.z.ai/api/paas/v4/chat/completions"; // pastikan benar

        System.out.println("Streaming mode. Ketik pesan (CTRL+C untuk keluar).");

        while (true) {
            System.out.print("\nKamu: ");
            String userInput = sc.nextLine();
            if (userInput == null) break;

            // Build payload - set "stream": true so server streams (if available)
            String payload = """
            {
              "model": "glm-4.6",
              "messages": [
                {"role": "user", "content": "%s"}
              ],
              "stream": true
            }
            """.formatted(userInput.replace("\"", "\\\""));

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(endpoint))
                    .timeout(Duration.ofMinutes(10))
                    .header("Authorization", "Bearer " + apiKey)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(payload))
                    .build();

            System.out.print("AI: ");
            HttpResponse<InputStream> resp = client.send(request, HttpResponse.BodyHandlers.ofInputStream());
            int status = resp.statusCode();
            if (status / 100 != 2) {
                // non-2xx
                String err = new String(resp.body().readAllBytes());
                System.out.println("\n[ERROR] status=" + status + " body=" + err);
                continue;
            }

            // Read stream
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(resp.body()))) {
                String line;
                StringBuilder buffer = new StringBuilder();
                // We'll look for content fragments in any incoming text.
                Pattern contentPattern = Pattern.compile("\"content\"\\s*:\\s*\"([^\"]*)\"");
                // Also handle lines that start with "data: " (SSE-like)
                while ((line = reader.readLine()) != null) {
                    // Some servers send empty lines as keepalive
                    if (line.isEmpty()) continue;

                    // If it's SSE-like: strip leading "data: "
                    if (line.startsWith("data: ")) {
                        line = line.substring(6);
                        // handle "[DONE]" sentinel
                        if (line.trim().equals("[DONE]")) break;
                    }

                    // Append to buffer for multi-line fragments
                    buffer.append(line).append('\n');

                    // Try to find and print all complete "content":"..." occurrences
                    Matcher m = contentPattern.matcher(buffer);
                    int lastEnd = 0;
                    boolean foundAny = false;
                    StringBuilder newBuffer = new StringBuilder();
                    while (m.find()) {
                        foundAny = true;
                        String chunk = m.group(1);
                        // Unescape simple sequences
                        String out = chunk.replace("\\n", "\n").replace("\\\"", "\"").replace("\\\\", "\\");
                        // Print without newline end so it feels streaming
                        System.out.print(out);
                        // track end to keep remainder in buffer (if any)
                        lastEnd = m.end();
                    }
                    if (foundAny) {
                        // keep remainder after last match (may be partial JSON)
                        if (lastEnd < buffer.length()) {
                            newBuffer.append(buffer.substring(lastEnd));
                        }
                        buffer = newBuffer;
                        System.out.flush();
                    } else {
                        // Avoid buffer growing unbounded: if buffer large and no match, trim it to last 1024 chars
                        if (buffer.length() > 4096) {
                            buffer = new StringBuilder(buffer.substring(buffer.length() - 1024));
                        }
                    }
                } // end read loop
            } catch (Exception e) {
                System.out.println("\n[STREAM ERROR] " + e.getMessage());
            }

            System.out.println("\n\n[stream ended]");
        } // end while
    }
}
