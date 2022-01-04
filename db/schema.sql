DROP DATABASE IF EXISTS employeeTracker_db;
CREATE DATABASE employeeTracker_db;

USE employeeTracker_db;


CREATE TABLE departments (
 id INT NOT NULL AUTO_INCREMENT, 
 dept_name VARCHAR(30) NOT NULL,
 PRIMARY KEY (id)
);

CREATE TABLE roles (
    id INT NOT NULL AUTO_INCREMENT,
    title VARCHAR(30),
    salary DECIMAL(6,2),
    department_ID INT,
    PRIMARY KEY(id),
    FOREIGN KEY (department_ID)
  REFERENCES departments(id)
);

CREATE TABLE employees (
    id INT NOT NULL AUTO_INCREMENT,
    first_name VARCHAR(30),
    last_name VARCHAR(30),
    role_id INT,
    manager_id INT,
    PRIMARY KEY(id),

    FOREIGN KEY (role_id)
    REFERENCES roles(id),

    FOREIGN KEY (manager_id)
    REFERENCES employees(id)
);
