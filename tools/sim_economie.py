# Simulatie van de munten-economie in game.js (z0/z8-regels):
# winst 100 + 20*goals, gelijk 40, verlies 15; friendly de helft;
# opdrachten tot +280/dag; seizoensprijs 500/300/200/100; beker 400/200/100.
# Markt: prijs = round(20 + (base-50)^2*0.9); upgrade = 60*(lvl+1), max +5.
# Gebruik: python tools/sim_economie.py
import math
import random


def poisson(lam):
    l, k, p = math.exp(-lam), 0, 1.0
    while True:
        k += 1
        p *= random.random()
        if p <= l:
            return k - 1


def speel(ts_a, ts_b, seizoen=True):
    ga = poisson(1.4 * (ts_a / ts_b) ** 2.4)
    gb = poisson(1.4 * (ts_b / ts_a) ** 2.4)
    munten = 100 + 20 * ga if ga > gb else 40 if ga == gb else 15
    return munten if seizoen else munten / 2, ga, gb


def run(days=30, wedstrijden_per_dag=3):
    rnd = random.Random(42)
    munten, team = 300, 61.0
    per_match = []
    for _ in range(days * wedstrijden_per_dag):
        m, ga, gb = speel(team, 62, wedstrijden_per_dag < 4)
        winst = 0.5 * (ga == gb and 0 or 0)
        munten += m
        # opdrachten (max 280 per 3 wedstrijden, haalbaar ~70%)
        munten += 280 * 0.7 / wedstrijden_per_dag
        team = min(85, team + (0.02 if ga > gb else 0))
        per_match.append(m)
    # team volledig +5: 5 kaarten x (60+120+180+240+300) = 4500
    print(f"{days} dagen x {wedstrijden_per_dag} matchen: {sum(per_match):.0f} matchmunten "
          f"(gem {sum(per_match)/len(per_match):.0f}/match), einde saldo {munten:.0f}")
    print("Volledige +5 opstelling kost 4500 munten =", 4500 / (sum(per_match) / len(per_match)), "matchen")
    print("Topkaart op de markt (base 80):", round(20 + (80 - 50) ** 2 * 0.9), "munten")


for w in (2, 3):
    run(30, w)
