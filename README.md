# HyphaeOS Project

This repository contains the HyphaeOS backend and frontend.

## Setup

1. Install the required Python packages:
   ```bash
   pip install -r requirements.txt
   ```
2. Copy `.env.example` to `.env` and fill in the real credentials for Redis, the database and SMTP:
   ```bash
   cp .env.example .env
   # then edit .env
   ```
3. Run the application:
   ```bash
   python main.py
   ```
