"""
Seed the database with real Indian heritage sites and leads.
Run from the SIH/backend parent directory:
    python -m backend.seed

Data sourced from publicly known locations of Indian heritage structures.
"""

from database import SessionLocal, engine, Base
from models import (
    HeritageSite, HeritageLead,
    HeritageCategory, VerificationStatus, LeadStatus,
)
from geoalchemy2.elements import WKTElement

Base.metadata.create_all(bind=engine)


SITES = [
    {
        "id": "chand-baori-abhaneri",
        "name": "Chand Baori Stepwell",
        "description": (
            "One of the deepest and largest stepwells in India, built by King Chanda of the Nikumbha dynasty "
            "around the 9th century CE. Located in Abhaneri village, Rajasthan, it has 3,500 narrow steps "
            "arranged in a perfect geometric pattern descending 13 storeys to the water below."
        ),
        "category": HeritageCategory.Monument,
        "longitude": 76.6072,
        "latitude": 27.0094,
        "zoom_level": 16.0,
        "pitch": 50.0,
        "bearing": -20.0,
        "verification_status": VerificationStatus.authority_verified,
    },
    {
        "id": "rani-ki-vav-patan",
        "name": "Rani ki Vav (Queen's Stepwell)",
        "description": (
            "A UNESCO World Heritage Site built in the 11th century by Queen Udayamati in memory of her "
            "husband, King Bhimdev I. Located in Patan, Gujarat, this inverted temple stepwell features "
            "over 500 principal sculptures and more than a thousand minor ones, depicting Vishnu avatars "
            "and divine figures."
        ),
        "category": HeritageCategory.Monument,
        "longitude": 72.1006,
        "latitude": 23.8587,
        "zoom_level": 16.5,
        "pitch": 55.0,
        "bearing": 10.0,
        "verification_status": VerificationStatus.authority_verified,
    },
    {
        "id": "hampi-vitthala-temple",
        "name": "Vittala Temple Complex, Hampi",
        "description": (
            "The Vittala Temple at Hampi, Karnataka, is a 15th–16th century Vijayanagara architectural "
            "masterpiece. Famous for its iconic Stone Chariot (Garuda Shrine), the musical pillars that "
            "produce musical notes when tapped, and the ornate mandapas. A UNESCO World Heritage Site."
        ),
        "category": HeritageCategory.AncientRuins,
        "longitude": 76.4732,
        "latitude": 15.3358,
        "zoom_level": 16.0,
        "pitch": 45.0,
        "bearing": 30.0,
        "verification_status": VerificationStatus.authority_verified,
    },
    {
        "id": "majuli-satras-assam",
        "name": "Majuli Satras (Vaishnavite Monasteries)",
        "description": (
            "Majuli island in Assam is home to ancient Vaishnavite monastery-villages called Satras, "
            "established by the saint-scholar Srimanta Sankardeva in the 15th century. They preserve "
            "unique forms of Assamese classical music (Borgeet), dance (Sattriya), and mask-making traditions."
        ),
        "category": HeritageCategory.FolkloreSite,
        "longitude": 94.2167,
        "latitude": 26.9500,
        "zoom_level": 14.0,
        "pitch": 40.0,
        "bearing": 0.0,
        "verification_status": VerificationStatus.community_corroborated,
    },
    {
        "id": "bishnoi-sacred-grove-jodhpur",
        "name": "Bishnoi Sacred Grove & Village",
        "description": (
            "The Bishnoi community near Jodhpur, Rajasthan, has protected the natural environment for "
            "over 500 years based on 29 tenets laid by Guru Jambeshwar in 1485 CE. Their sacred groves "
            "(Orans) and the famous Chipko-like Khejadali Massacre of 1730 CE define this living "
            "heritage of ecological conservation and tribal culture."
        ),
        "category": HeritageCategory.SacredGrove,
        "longitude": 72.8777,
        "latitude": 26.5500,
        "zoom_level": 13.5,
        "pitch": 35.0,
        "bearing": 0.0,
        "verification_status": VerificationStatus.community_corroborated,
    },
    {
        "id": "kanchipuram-silk-weavers",
        "name": "Kanchipuram Silk Weaving Heritage",
        "description": (
            "Kanchipuram in Tamil Nadu has been a centre of silk weaving for over 400 years. "
            "The Devangar community weavers produce the legendary Kanjivaram silk sarees using pure "
            "mulberry silk, real gold (zari) threads, and traditional interlocking weft techniques. "
            "Recognised as a GI-tagged product of India."
        ),
        "category": HeritageCategory.TraditionalCraftHub,
        "longitude": 79.7036,
        "latitude": 12.8342,
        "zoom_level": 14.5,
        "pitch": 40.0,
        "bearing": 15.0,
        "verification_status": VerificationStatus.authority_verified,
    },
    {
        "id": "dholavira-harappan-city",
        "name": "Dholavira – Harappan City",
        "description": (
            "Dholavira in the Rann of Kutch, Gujarat, is one of the largest and best-preserved "
            "Harappan (Indus Valley Civilization) sites, dating back to 2650–1450 BCE. A UNESCO World "
            "Heritage Site (2021), it features an elaborate water conservation system, multi-tiered "
            "citadel, and the world's first known signboard with the Indus script."
        ),
        "category": HeritageCategory.AncientRuins,
        "longitude": 70.2155,
        "latitude": 23.8896,
        "zoom_level": 15.5,
        "pitch": 50.0,
        "bearing": -10.0,
        "verification_status": VerificationStatus.authority_verified,
    },
    {
        "id": "spiti-key-monastery",
        "name": "Key Monastery (Ki Gompa), Spiti",
        "description": (
            "Key Monastery, perched at 4,166 m in the Spiti Valley of Himachal Pradesh, is the largest "
            "Buddhist monastery in the Spiti district. Founded around the 11th century, it houses "
            "rare thangkas, manuscripts, and musical instruments, and serves as a training centre "
            "for Buddhist monks."
        ),
        "category": HeritageCategory.FolkloreSite,
        "longitude": 78.0136,
        "latitude": 32.2967,
        "zoom_level": 14.0,
        "pitch": 60.0,
        "bearing": 20.0,
        "verification_status": VerificationStatus.community_corroborated,
    },
]


LEADS = [
    {
        "id": "lead-adalaj-stepwell",
        "name": "Adalaj Stepwell (Rudabai Vav)",
        "description": (
            "A five-storey stepwell built in 1499 CE by Queen Rudabai in memory of her husband. "
            "Located in Adalaj village near Ahmedabad, Gujarat. Features ornate Indo-Islamic carvings "
            "and is less documented compared to its fame. Requires detailed oral history collection."
        ),
        "category": HeritageCategory.Monument,
        "longitude": 72.5803,
        "latitude": 23.1673,
        "village_or_area": "Adalaj, Gandhinagar District, Gujarat",
        "submitted_by": "Local History Researcher",
        "status": LeadStatus.needs_documentation,
    },
    {
        "id": "lead-lonar-crater-temples",
        "name": "Ancient Temples at Lonar Crater",
        "description": (
            "The Lonar Crater lake in Maharashtra has several ancient temples on its rim and inside "
            "the crater basin, some partially submerged. Temples dedicated to Vishnu and Shiva date "
            "to the Chalukya and Yadava periods. Local oral traditions about the crater's origin "
            "need documentation."
        ),
        "category": HeritageCategory.AncientRuins,
        "longitude": 76.5097,
        "latitude": 19.9753,
        "village_or_area": "Lonar, Buldhana District, Maharashtra",
        "submitted_by": "Geology Student",
        "status": LeadStatus.needs_documentation,
    },
    {
        "id": "lead-banni-grasslands-kutch",
        "name": "Banni Grasslands & Maldhari Folk Heritage",
        "description": (
            "The Banni grasslands in Kutch, Gujarat, are home to the Maldhari pastoral communities "
            "whose folk music, embroidery traditions, and nomadic heritage are at risk of being lost. "
            "Their seasonal migration patterns and oral traditions have not been digitally documented."
        ),
        "category": HeritageCategory.FolkloreSite,
        "longitude": 70.0833,
        "latitude": 23.7500,
        "village_or_area": "Banni Grasslands, Kutch, Gujarat",
        "submitted_by": "NGO Field Worker",
        "status": LeadStatus.claimed,
        "assigned_contributor": "Heritage Volunteer – Kutch Chapter",
    },
    {
        "id": "lead-kondapalli-toy-craft",
        "name": "Kondapalli Toy-Making Village",
        "description": (
            "Kondapalli near Vijayawada, Andhra Pradesh, is known for 400-year-old wooden toy making "
            "traditions using a special soft wood (Tella Poniki). GI-tagged crafts but only a few "
            "artisan families remain. Their techniques, dyes, and folk stories need urgent documentation."
        ),
        "category": HeritageCategory.TraditionalCraftHub,
        "longitude": 80.5326,
        "latitude": 16.6108,
        "village_or_area": "Kondapalli, Krishna District, Andhra Pradesh",
        "submitted_by": "Craft Heritage Enthusiast",
        "status": LeadStatus.needs_documentation,
    },
]


def seed():
    db = SessionLocal()
    try:
        inserted_sites = 0
        for s in SITES:
            if db.query(HeritageSite).filter(HeritageSite.id == s["id"]).first():
                print(f"  [skip] Site already exists: {s['id']}")
                continue
            point = WKTElement(f"POINT({s['longitude']} {s['latitude']})", srid=4326)
            site = HeritageSite(
                id=s["id"],
                name=s["name"],
                description=s["description"],
                category=s["category"],
                location=point,
                zoom_level=s.get("zoom_level", 15.0),
                pitch=s.get("pitch", 45.0),
                bearing=s.get("bearing", 0.0),
                verification_status=s.get("verification_status", VerificationStatus.community_reported),
            )
            db.add(site)
            inserted_sites += 1

        inserted_leads = 0
        for l in LEADS:
            if db.query(HeritageLead).filter(HeritageLead.id == l["id"]).first():
                print(f"  [skip] Lead already exists: {l['id']}")
                continue
            point = WKTElement(f"POINT({l['longitude']} {l['latitude']})", srid=4326)
            lead = HeritageLead(
                id=l["id"],
                name=l["name"],
                description=l["description"],
                category=l["category"],
                location=point,
                village_or_area=l["village_or_area"],
                submitted_by=l["submitted_by"],
                status=l.get("status", LeadStatus.needs_documentation),
                assigned_contributor=l.get("assigned_contributor"),
            )
            db.add(lead)
            inserted_leads += 1

        db.commit()
        print(f"\n✅ Seeded {inserted_sites} heritage sites and {inserted_leads} heritage leads.")

    except Exception as e:
        db.rollback()
        print(f"\n❌ Seed failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    print("🌱 Seeding LokVirasat database...")
    seed()
