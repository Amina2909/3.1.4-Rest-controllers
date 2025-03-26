package ru.kata.spring.boot_security.demo.service;

import ru.kata.spring.boot_security.demo.DTO.UserDTO;
import ru.kata.spring.boot_security.demo.model.User;

import java.util.List;

public interface UserService {
    List<User> findAll();

    User findUserByID(Long id);

    User addUser(UserDTO userDTO);

    User updateUser(Long id, UserDTO userDTO);

    void deleteUser(Long id);
}

