USE revup;

INSERT INTO users (id, name, email, phone, date_of_birth, role)
VALUES
(
    1,
    'Admin',
    'admin@mail.com',
    '050-0000000',
    '1980-01-01',
    'admin'
);
INSERT INTO passwords (user_id, password_hash)
VALUES (
    1,
    '$2b$10$cc8uwm2UeHNW//64WYoJ4.3g2NfEs/Yf67aORYJ7j1FhaSh1dvQ1S'
);
