-- Default admin: admin / lemillion2024
UPDATE admin
SET password_hash = '$2b$10$UQxDLtADE8ATxKkvVmknD.9pfpX3ohoM.Rg1trBbOgyJErkaLkpMW'
WHERE username = 'admin';

INSERT INTO admin (username, password_hash, nama_lengkap)
VALUES ('admin', '$2b$10$UQxDLtADE8ATxKkvVmknD.9pfpX3ohoM.Rg1trBbOgyJErkaLkpMW', 'Administrator')
ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash;
