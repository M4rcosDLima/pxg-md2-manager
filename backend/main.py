# backend/main.py

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from db import firebase_db
from pydantic import BaseModel
import uuid

app = FastAPI()

# Permitir chamadas do frontend local
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Pode ajustar para ["http://localhost:5500"] etc.
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/personagens")
def listar_personagens():
    """Lista todos os personagens."""
    data = firebase_db.child("personagens").get().val()
    return data or {}

@app.post("/personagens")
def adicionar_personagem(data: dict):
    """Adiciona um novo personagem com dados obrigatórios."""
    if "nome" not in data or "uid" not in data:
        raise HTTPException(status_code=400, detail="Nome e UID são obrigatórios.")
    firebase_db.child("personagens").push(data)
    return {"status": "ok", "message": "Personagem criado com sucesso"}

@app.put("/personagens/{id}")
def atualizar_personagem(id: str, data: dict):
    """Atualiza dados de um personagem específico, sem ultrapassar o máximo de energia."""
    personagem = firebase_db.child("personagens").child(id).get().val()
    if not personagem:
        raise HTTPException(status_code=404, detail="Personagem não encontrado.")

    # Garante que as energias não ultrapassem o máximo
    if "energia_azul" in data:
        max_azul = personagem.get("max_azul", 100)
        data["energia_azul"] = min(data["energia_azul"], max_azul)

    if "energia_vermelha" in data:
        max_vermelha = personagem.get("max_vermelha", 100)
        data["energia_vermelha"] = min(data["energia_vermelha"], max_vermelha)

    firebase_db.child("personagens").child(id).update(data)
    return {"status": "ok", "message": "Atualizado com sucesso"}

@app.delete("/personagens/{id}")
def remover_personagem(id: str):
    """Remove um personagem pelo ID."""
    firebase_db.child("personagens").child(id).remove()
    return {"status": "ok", "message": "Removido com sucesso"}


# Modelo para validação de Dungeon
class Dungeon(BaseModel):
    nome: str
    tipo: str              # "azul" ou "vermelha"
    quantidade: int
    imagem: str            # nome do arquivo da imagem
    uid: str               # usuário criador da dungeon

# LISTAR DUNGEONS
from typing import Optional

@app.get("/dungeons")
def listar_dungeons(uid: Optional[str] = None):
    data = firebase_db.child("dungeons").get().val()
    if not data:
        return {}

    # Se uid foi fornecido, filtra
    if uid:
        data = {k: v for k, v in data.items() if v.get("uid") == uid}

    return data

# CADASTRAR NOVA DUNGEON
@app.post("/dungeons")
def adicionar_dungeon(dungeon: Dungeon):
    """Cadastra uma nova dungeon."""
    dungeon_id = str(uuid.uuid4())
    dados = dungeon.dict()

    # ⚠️ Verificação extra aqui:
    if "uid" not in dados:
        raise HTTPException(status_code=400, detail="UID é obrigatório")

    firebase_db.child("dungeons").child(dungeon_id).set(dados)
    return {"status": "ok", "id": dungeon_id, "message": "Dungeon cadastrada com sucesso"}

@app.put("/dungeons/{id}")
def editar_dungeon(id: str, data: dict):
    firebase_db.child("dungeons").child(id).update(data)
    return {"ok": True}

@app.delete("/dungeons/{id}")
def excluir_dungeon(id: str):
    firebase_db.child("dungeons").child(id).remove()
    return {"ok": True}
