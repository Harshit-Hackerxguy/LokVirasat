# LokVirasat Backend

FastAPI + PostgreSQL/PostGIS backend for LokVirasat.

## One-time Setup (Arch Linux)

Run these commands **in your terminal**:

```bash
# 1. Initialize PostgreSQL data directory
sudo -u postgres initdb -D /var/lib/postgres/data

# 2. Start and enable PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# 3. Create the database and enable the PostGIS extension
sudo -u postgres psql -c "CREATE DATABASE lokvirasat;"
sudo -u postgres psql -d lokvirasat -c "CREATE EXTENSION IF NOT EXISTS postgis;"
```

## Running the Backend

From the `/home/harshit/SIH/` directory:

```bash
# Activate the virtual environment
source backend/venv/bin/activate

# Seed the database with real Indian heritage sites
python -m backend.seed

# Start the API server (hot-reload)
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- **API docs (Swagger UI):** http://localhost:8000/docs
- **Sites:** http://localhost:8000/api/sites/
- **Leads:** http://localhost:8000/api/leads/
- **Uploaded images:** http://localhost:8000/uploads/

## API Endpoints

### Heritage Sites
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/sites/` | List all documented sites |
| GET | `/api/sites/{id}` | Get a single site |
| POST | `/api/sites/` | Create a new site |
| DELETE | `/api/sites/{id}` | Delete a site |
| POST | `/api/sites/{id}/images` | Upload an image |

### Heritage Leads
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/leads/` | List all leads |
| GET | `/api/leads/{id}` | Get a single lead |
| POST | `/api/leads/` | Submit a new lead |
| PATCH | `/api/leads/{id}/status` | Update lead status |

## Project Structure

```
backend/
├── __init__.py
├── main.py          # FastAPI app entry point
├── config.py        # Settings from .env
├── database.py      # SQLAlchemy engine + session
├── models.py        # ORM models (heritage_sites, heritage_leads, site_images)
├── schemas.py       # Pydantic v2 schemas
├── crud.py          # DB query helpers
├── seed.py          # Seed script with real Indian heritage data
├── requirements.txt
├── .env             # Your local environment (not committed)
├── .env.example     # Template
├── venv/            # Python virtual environment
└── routers/
    ├── sites.py     # /api/sites routes
    └── leads.py     # /api/leads routes
```
