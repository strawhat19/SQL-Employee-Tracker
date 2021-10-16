DROP DATABASE IF EXISTS employee_db;
CREATE DATABASE employee_db;
USE employee_db;

DROP TABLE IF EXISTS department;
CREATE TABLE department (
      id INT NOT NULL AUTO_INCREMENT,
      departmentName VARCHAR(30),
      PRIMARY KEY(id)
      );

DROP TABLE IF EXISTS role;

CREATE TABLE role (
      roleID INT NOT NULL AUTO_INCREMENT,
      title VARCHAR(255),
      salary INT,
      departmentID INT NULL,
      FOREIGN KEY (departmentID)
      REFERENCES department(id) 
      ON DELETE SET NULL,
      PRIMARY KEY(roleID)
      );

DROP TABLE IF EXISTS employee;
CREATE TABLE employee (
      employeeID INT PRIMARY KEY AUTO_INCREMENT,
      firstName VARCHAR(30) NOT NULL,
      lastName VARCHAR(30) NOT NULL,
      roleID INT NULL,
      managerID INT NULL,
      FOREIGN KEY (roleID)
      REFERENCES role(roleID)
      ON DELETE SET NULL
      );