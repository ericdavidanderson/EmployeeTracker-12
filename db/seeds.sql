USE employeeTracker_db;

INSERT INTO departments (dept_name)
VALUES ("engineering"),
("finance"),
("legal");

INSERT INTO roles (id, title, salary, department_ID)

VALUES (1, "Lead Engineer", 250000, 1 ),
(2, "Software Engineer", 175000, 1),
(3, "Support Engineer", 125000, 1),
(4, "Account Manager", 160000, 2),
(5, "Accountant", 125000, 2),
(6, "Legal Team Lead", 275000, 3),
(7, "Attorney", 190000, 3);

INSERT INTO employees (first_name, last_name,role_id, manager_id)

VALUES ("John", "Smith",1, null),
("Heather", "Thompson", 2, 1),
("Tom", "Jones", 3, 1),
("Vlad", "Mortskin", 4, 1),
("Thom", "Shea", 5, 1),
("Sarah","Jenkins", 6, 1),
("Kai", "Hanz", 7, 1);


       
