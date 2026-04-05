package com.codingtutor.backend.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/workspace")
public class WorkspaceController {

    // The base directory for student workspace.
    // It's up one directory out of the 'backend' folder.
    private final String WORKSPACE_DIR = "../student-workspace";

    @GetMapping("/tree")
    public List<Map<String, Object>> getWorkspaceTree() {
        File root = new File(WORKSPACE_DIR);
        if (!root.exists()) {
            root.mkdirs();
        }
        return buildTree(root);
    }

    private List<Map<String, Object>> buildTree(File dir) {
        List<Map<String, Object>> nodes = new ArrayList<>();
        File[] files = dir.listFiles();
        if (files != null) {
            for (File file : files) {
                Map<String, Object> node = new HashMap<>();
                node.put("name", file.getName());
                node.put("path", file.getPath().replace("\\", "/"));
                node.put("isDir", file.isDirectory());
                if (file.isDirectory()) {
                    node.put("children", buildTree(file));
                }
                nodes.add(node);
            }
        }
        return nodes;
    }

    @GetMapping("/file")
    public ResponseEntity<String> getFileContent(@RequestParam("path") String filepath) {
        try {
            Path path = Paths.get(filepath);
            // Basic security check to ensure we only read inside student-workspace
            if (!path.toAbsolutePath().normalize().toString().contains("student-workspace")) {
                return ResponseEntity.status(403).body("Access Denied");
            }
            String content = Files.readString(path);
            return ResponseEntity.ok(content);
        } catch (IOException e) {
            return ResponseEntity.status(404).body("File not found or cannot be read.");
        }
    }
}
