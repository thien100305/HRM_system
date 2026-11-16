package com.hrm.hrm_system.service;

import com.hrm.hrm_system.entity.Position;
import com.hrm.hrm_system.repository.PositionRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PositionService {

    private final PositionRepository repository;

    public PositionService(
            PositionRepository repository) {

        this.repository = repository;
    }

    public List<Position> getAllPositions() {
        return repository.findAll();
    }

    public Position getPositionById(Long id) {
        return repository.findById(id)
                .orElse(null);
    }

    private String generatePositionCode(
            String positionName) {

        String[] words = positionName.trim()
                .split("\\s+");

        StringBuilder code = new StringBuilder();

        for (String word : words) {

            code.append(
                    Character.toUpperCase(
                            word.charAt(0)));
        }

        return code.toString();
    }

    public Position createPosition(
            Position position) {

        position.setPositionCode(
                generatePositionCode(
                        position.getName()));

        return repository.save(position);
    }

    public Position updatePosition(
            Long id,
            Position position) {

        Position existing = repository.findById(id)
                .orElse(null);

        if (existing == null) {
            return null;
        }

        existing.setName(
                position.getName());

        existing.setDescription(
                position.getDescription());

        existing.setPositionCode(
                generatePositionCode(
                        position.getName()));

        return repository.save(
                existing);
    }

    public void deletePosition(Long id) {
        repository.deleteById(id);
    }

}
