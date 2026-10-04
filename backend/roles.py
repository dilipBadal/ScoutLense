"""Auditable role scorecards: descriptive statistics, not tactical success predictions."""
POSITIONS = {
    'GK': 'Goalkeeper', 'CB': 'Centre-back', 'LB': 'Left-back', 'RB': 'Right-back',
    'DM': 'Defensive midfield', 'CM': 'Central midfield', 'AM': 'Attacking midfield',
    'LM': 'Left midfield', 'RM': 'Right midfield', 'LW': 'Left wing', 'RW': 'Right wing',
    'SS': 'Second striker', 'ST': 'Centre-forward',
}
METRICS = {
    'npxg': ('Non-penalty xG', '/90'), 'shots': ('Shots', '/90'), 'xa': ('Expected assists', '/90'),
    'key_passes': ('Key passes', '/90'), 'big_chances': ('Big chances created', '/90'),
    'final_third_passes': ('Final-third passes', '/90'), 'pass_accuracy': ('Pass accuracy', '%'),
    'aerial_win': ('Aerial duels won', '%'), 'aerials': ('Aerial duels won', '/90'),
    'ground_win': ('Ground duels won', '%'), 'interceptions': ('Interceptions', '/90'),
    'tackles': ('Tackles won', '/90'), 'clearances': ('Clearances', '/90'),
    'recoveries': ('Ball recoveries', '/90'), 'dribbles': ('Successful dribbles', '/90'),
    'long_accuracy': ('Long-ball accuracy', '%'), 'passes': ('Completed passes', '/90'),
    'crosses': ('Accurate crosses', '/90'), 'losses': ('Possession lost', '/90'),
    'save_pct': ('Save percentage proxy', '%'), 'claims': ('High claims', '/90'),
    'sweeps': ('Successful runs out', '/90'), 'saves': ('Saves', '/90'),
    'conceded': ('Goals conceded', '/90'),
}
# These describe observable tendencies; events cannot establish movement or pressing roles.
ROLE_SPECS = [
    ('shot_stopper', 'Shot-stopping goalkeeper', ['GK'], 'Prioritises saves relative to recorded goals conceded; shot quality is not controlled.', {'save_pct': .70, 'claims': .20, 'long_accuracy': .10}),
    ('sweeper_keeper', 'Sweeper goalkeeper', ['GK'], 'Combines recorded successful runs out, distribution and shot stopping.', {'sweeps': .35, 'save_pct': .30, 'pass_accuracy': .20, 'claims': .15}),
    ('distributing_keeper', 'Distributing goalkeeper', ['GK'], 'Emphasises short and long distribution alongside shot stopping.', {'pass_accuracy': .35, 'long_accuracy': .30, 'save_pct': .25, 'passes': .10}),
    ('defender', 'Defensive centre-back', ['CB'], 'Competes in duels, intercepts play and helps defend the penalty area.', {'aerial_win': .30, 'ground_win': .25, 'interceptions': .20, 'tackles': .15, 'clearances': .10}),
    ('ball_playing_cb', 'Ball-playing centre-back', ['CB'], 'Balances passing volume and accuracy with defensive contribution.', {'pass_accuracy': .25, 'passes': .20, 'long_accuracy': .20, 'interceptions': .20, 'aerial_win': .15}),
    ('covering_cb', 'Covering centre-back', ['CB'], 'Prioritises interceptions and recoveries; recovery speed is not measured.', {'interceptions': .35, 'recoveries': .25, 'ground_win': .25, 'clearances': .15}),
    ('defensive_fullback', 'Defensive full-back', ['LB', 'RB'], 'Emphasises ground duels, tackles and interceptions.', {'ground_win': .30, 'tackles': .30, 'interceptions': .25, 'pass_accuracy': .15}),
    ('attacking_fullback', 'Attacking full-back', ['LB', 'RB'], 'Supplies width through crossing and chance creation with defensive contribution.', {'crosses': .30, 'key_passes': .25, 'final_third_passes': .20, 'dribbles': .15, 'tackles': .10}),
    ('wingback', 'Attacking wing-back', ['LB', 'RB', 'LM', 'RM'], 'A width-focused recruitment profile; listed position alone does not prove wing-back experience.', {'crosses': .30, 'dribbles': .25, 'key_passes': .20, 'recoveries': .15, 'tackles': .10}),
    ('inverted_fullback', 'Possession / inverted full-back', ['LB', 'RB'], 'Uses passing and recovery as proxies; inward movement needs event-location evidence.', {'passes': .25, 'pass_accuracy': .25, 'final_third_passes': .25, 'recoveries': .15, 'ground_win': .10}),
    ('anchor', 'Holding midfielder', ['DM', 'CM'], 'Protects possession through interceptions, recovery and reliable passing.', {'interceptions': .30, 'recoveries': .25, 'tackles': .20, 'pass_accuracy': .15, 'ground_win': .10}),
    ('ball_winner', 'Ball-winning midfielder', ['DM', 'CM'], 'Prioritises recorded tackles, duel success and regaining possession.', {'tackles': .35, 'ground_win': .25, 'interceptions': .25, 'recoveries': .15}),
    ('deep_playmaker', 'Deep-lying playmaker', ['DM', 'CM'], 'Connects play with accurate passing and delivery into the final third.', {'passes': .25, 'pass_accuracy': .20, 'long_accuracy': .25, 'final_third_passes': .20, 'key_passes': .10}),
    ('box_to_box', 'Box-to-box midfielder', ['CM'], 'Balances recovery, duels, attacking passes and shooting; running coverage is unverified.', {'recoveries': .25, 'ground_win': .20, 'final_third_passes': .25, 'shots': .15, 'key_passes': .15}),
    ('controller', 'Possession controller', ['CM', 'DM'], 'Emphasises passing volume, accuracy and connecting the attacking third.', {'passes': .35, 'pass_accuracy': .30, 'final_third_passes': .25, 'recoveries': .10}),
    ('creator', 'Creative midfielder', ['CM', 'AM'], 'Creates chances and connects possession in the attacking third.', {'xa': .30, 'key_passes': .30, 'big_chances': .15, 'final_third_passes': .15, 'pass_accuracy': .10}),
    ('attacking_playmaker', 'Attacking playmaker', ['AM', 'SS'], 'Prioritises chance creation and dribbling between attacking actions.', {'xa': .30, 'key_passes': .30, 'big_chances': .20, 'dribbles': .20}),
    ('shadow_striker', 'Goalscoring attacking midfielder', ['AM', 'SS'], 'Adds shooting threat from an attacking midfield or second-striker position.', {'npxg': .40, 'shots': .30, 'dribbles': .15, 'key_passes': .15}),
    ('wide_playmaker', 'Wide playmaker', ['LW', 'RW', 'LM', 'RM'], 'Creates chances from a wide position through passing and dribbling.', {'xa': .30, 'key_passes': .30, 'big_chances': .20, 'dribbles': .20}),
    ('touchline_winger', 'Crossing winger', ['LW', 'RW', 'LM', 'RM'], 'Emphasises crossing, dribbling and creating shooting opportunities.', {'crosses': .35, 'dribbles': .30, 'key_passes': .25, 'big_chances': .10}),
    ('inside_forward', 'Goalscoring wide forward', ['LW', 'RW'], 'Emphasises wide-player shooting threat; inward movement is not measured.', {'npxg': .40, 'shots': .25, 'dribbles': .20, 'xa': .15}),
    ('wide_midfielder', 'Balanced wide midfielder', ['LM', 'RM', 'LW', 'RW'], 'Balances crossing and creativity with recoveries and tackles.', {'crosses': .25, 'key_passes': .25, 'recoveries': .25, 'tackles': .15, 'pass_accuracy': .10}),
    ('goalscorer', 'Goalscoring striker', ['ST', 'SS'], 'Finds shooting opportunities and contributes consistent non-penalty threat.', {'npxg': .40, 'shots': .25, 'xa': .15, 'aerial_win': .10, 'key_passes': .10}),
    ('target_forward', 'Target forward', ['ST'], 'Combines aerial involvement and success with shooting and supporting passes.', {'aerial_win': .30, 'aerials': .25, 'npxg': .20, 'shots': .15, 'key_passes': .10}),
    ('link_forward', 'Supporting / link forward', ['ST', 'SS'], 'Emphasises chance creation and passing alongside shooting threat.', {'xa': .30, 'key_passes': .25, 'pass_accuracy': .20, 'npxg': .15, 'passes': .10}),
    ('poacher', 'Penalty-area goalscorer', ['ST'], 'Prioritises non-penalty expected goals and shots; penalty-area movement is unverified.', {'npxg': .60, 'shots': .30, 'aerial_win': .10}),
]
ROLES = {key: {'name': name, 'position': positions[0], 'positions': positions,
               'description': description, 'weights': weights}
         for key, name, positions, description, weights in ROLE_SPECS}
