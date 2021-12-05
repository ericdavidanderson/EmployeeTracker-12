DROP DATABASE IF EXISTS employeeTracker_db;
CREATE DATABASE employeeTracker_db;

USE DATABASE employeeTracker_db;


CREATE TABLE Department (
 id INT NOT NULL,
 name VARCHAR(30) NOT NULL
);

CREATE TABLE Role (
    id INT NOT NULL,
    title VARCHAR(30),
    salary DECIMAL,
    department_ID INT
);

CREATE TABLE Employee (
    id INT NOT NULL,
    first_name VARCHAR(30),
    last_name VARCHAR(30),
    role_id INT,
    manager_id INT
)
