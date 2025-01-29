from sqlmodel import Field, Session, SQLModel, create_engine

# Code here omitted 👈

class AreaData(SQLModel, table=True):
    area_code: str = Field(primary_key=True)
    area_name: str
    area_name_wales: str | None = None
    la_code: str
    la_name: str
    la_name_wales: str | None = None
    uk_pc_code: str
    uk_pc_name: str
    uk_pc_name_wales: str | None = None
    country: str

sqlite_file_name = "hps_area_data.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"

connect_args = {"check_same_thread": False}
engine = create_engine(sqlite_url, echo=True, connect_args=connect_args)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session

SessionDep = Annotated[Session, Depends(get_session)]

app = FastAPI()

@app.on_event("startup")
def on_startup():
    create_db_and_tables()

@app.get("/areas/{area_code}")
def read_area(area_code: int, session: SessionDep) -> AreaData:
    area = session.get(AreaData, area_code)
    if not hero:
        raise HTTPException(status_code=404, detail="area_code not recognised.")
    return area