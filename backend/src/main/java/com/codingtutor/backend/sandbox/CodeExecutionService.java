package com.codingtutor.backend.sandbox;

import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.concurrent.TimeUnit;

@Service
public class CodeExecutionService {

    public String executeSandboxCommand(String[] command, String workingDirectory) {
        try {
            ProcessBuilder pb = new ProcessBuilder(command);
            if (workingDirectory != null) {
                pb.directory(new java.io.File(workingDirectory));
            }
            pb.redirectErrorStream(true);
            
            Process process = pb.start();
            boolean finished = process.waitFor(10, TimeUnit.SECONDS);

            if (!finished) {
                process.destroyForcibly();
                return "Error: Command timed out after 10 seconds.";
            }

            StringBuilder output = new StringBuilder();
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    output.append(line).append("\n");
                }
            }

            return output.toString();
        } catch (Exception e) {
            return "Execution failed: " + e.getMessage();
        }
    }
}
