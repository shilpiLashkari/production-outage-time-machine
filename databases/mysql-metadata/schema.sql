-- MySQL Schema for Service Metadata

CREATE TABLE services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    owner_team VARCHAR(255),
    tier ENUM('critical', 'standard', 'batch') DEFAULT 'standard',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE deployments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    service_id INT NOT NULL,
    version VARCHAR(50) NOT NULL,
    commit_hash VARCHAR(40),
    deployed_by VARCHAR(100),
    deployed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (service_id) REFERENCES services(id)
);
