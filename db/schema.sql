DROP DATABASE IF EXISTS employeeTracker_db;
CREATE DATABASE employeeTracker_db;

USE DATABASE employeeTracker_db;


CREATE TABLE departments (
 id INT NOT NULL AUTO_INCREMENT,
 name VARCHAR(30) NOT NULL,
 PRIMARY KEY (id)
);

CREATE TABLE roles (
    id INT NOT NULL,
    title VARCHAR(30),
    salary DECIMAL,
    department_ID INT
    FOREIGN KEY (department_ID)
  REFERENCES departments(id)
);

CREATE TABLE employees (
    id INT NOT NULL,
    first_name VARCHAR(30),
    last_name VARCHAR(30),
    role_id INT ,
    manager_id INT,
    FOREIGN KEY (role_id)
    REFERENCES roles(id),
    FOREIGN KEY (manager_id)
    REFERENCES employees(id)
)
