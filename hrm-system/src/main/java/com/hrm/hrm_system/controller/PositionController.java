package com.hrm.hrm_system.controller;

import com.hrm.hrm_system.entity.Position;
import com.hrm.hrm_system.service.PositionService;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/positions")
@CrossOrigin("*")
public class PositionController {

    private final PositionService service;

    public PositionController(PositionService service) {
        this.service = service;
    }

    @GetMapping
    public List<Position> getAllPositions() {
        return service.getAllPositions();
    }

    @GetMapping("/{id}")
    public Position getPositionById(@PathVariable Long id) {
        return service.getPositionById(id);
    }

    @PostMapping
    public Position createPosition(@RequestBody Position position) {
        return service.createPosition(position);
    }

    @PutMapping("/{id}")
    public Position updatePosition(
            @PathVariable Long id,
            @RequestBody Position position) {

        return service.updatePosition(id, position);
    }

    @DeleteMapping("/{id}")
    public String deletePosition(@PathVariable Long id) {

        service.deletePosition(id);

        return "Delete Success";
    }
}