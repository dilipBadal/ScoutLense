from typing import Literal
from pydantic import BaseModel, ConfigDict, Field, model_validator


class SearchRequest(BaseModel):
    model_config = ConfigDict(extra='forbid')
    team_id: str = Field(min_length=1, max_length=100)
    season: Literal['2526', '2425'] = '2526'
    role: str = Field(default='goalscorer', min_length=1, max_length=50)
    position: str = Field(default='ST', min_length=2, max_length=3)
    min_minutes: int = Field(default=900, ge=180, le=3420)
    max_age: int = Field(default=35, ge=16, le=45)
    max_value: int | None = Field(default=None, ge=0, le=1_000_000_000)
    foot: Literal['any', 'left', 'right', 'both'] = 'any'
    name: str = Field(default='', max_length=100)
    player_id: str | None = Field(default=None, pattern=r'^\d{1,15}$')
    purpose: Literal['recruitment', 'comparison'] = 'recruitment'
    page: int = Field(default=1, ge=1, le=1000)
    page_size: int = Field(default=5, ge=1, le=50)
    formation: str | None = Field(default=None, max_length=30)

    @model_validator(mode='after')
    def valid_position(self):
        from backend.roles import ROLES
        if self.role not in ROLES:
            raise ValueError('Unknown player role.')
        if self.position not in ROLES[self.role]['positions']:
            raise ValueError('Position does not support the selected role.')
        if self.formation and not all(p.isdigit() for p in self.formation.split('-')):
            raise ValueError('Formation must use numeric lines, for example 4-3-3.')
        if self.formation and sum(map(int, self.formation.split('-'))) != 10:
            raise ValueError('Formation must contain ten outfield players.')
        return self
