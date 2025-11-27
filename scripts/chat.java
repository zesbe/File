import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Scanner;

public class chat {
    public static void main(String[] args) throws Exception {
        Scanner sc = new Scanner(System.in);
        String apiKey = System.getenv("ZAI_API_KEY");

        if (apiKey == null || apiKey.isBlank()) {
            System.err.println("API key tidak ditemukan! Pastikan sudah export ZAI_API_KEY.");
            System.exit(1);
        }

        HttpClient client = HttpClient.newBuilder()
                .version(HttpClient.Version.HTTP_2)   // lebih cepat
                .build();

        String endpoint = "https://api.z.ai/api/paas/v4/chat/completions";

        System.out.println("Ketik pesan (CTRL + C untuk keluar):");

        while (true) {
            System.out.print("\nKamu: ");
            String userInput = sc.nextLine();

            // JSON payload
            String payload = """
            {
                "model": "glm-4.6",
                "messages": [
                    {"role": "user", "content": "%s"}
                ],
                "stream": false
            }
            """.formatted(userInput.replace("\"", "\\\""));

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(endpoint))
                    .header("Authorization", "Bearer " + apiKey)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(payload))
                    .build();

            HttpResponse<String> response =
                    client.send(request, HttpResponse.BodyHandlers.ofString());

            String json = response.body();

            // Extract "content" saja biar cepat (tanpa reasoning panjang)
            String key = "\"content\":\"";
            int start = json.indexOf(key);
            if (start == -1) {
                System.out.println("\nAI: [Tidak ada content]");
                continue;
            }

            start += key.length();
            int end = json.indexOf("\"", start);

            String content = json.substring(start, end)
                    .replace("\\n", "\n")
                    .replace("\\\"", "\"");

            System.out.println("\nAI: " + content);
        }
    }
}
