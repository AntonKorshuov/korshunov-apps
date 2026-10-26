import { Exercise, TopicId } from '../types';

export function generateExercise(topicId: TopicId): Exercise {
  const randId = Math.random().toString(36).substring(2, 9);

  switch (topicId) {
    case 'stellenwert': {
      // Stellenwerttafel: E, Z, H, T, ZT, HT, M
      const type = Math.floor(Math.random() * 3);
      if (type === 0) {
        // Welcher Stellenwert hat die Ziffer?
        const zt = Math.floor(Math.random() * 8) + 1; // 1-8
        const t = Math.floor(Math.random() * 9);
        const h = Math.floor(Math.random() * 9);
        const z = Math.floor(Math.random() * 9);
        const e = Math.floor(Math.random() * 9);
        const num = zt * 10000 + t * 1000 + h * 100 + z * 10 + e;
        const formattedNum = num.toLocaleString('de-DE');

        return {
          id: `sw_${randId}`,
          topicId: 'stellenwert',
          title: 'Stellenwert bestimmen',
          question: `Welche Ziffer steht in der Zahl ${formattedNum} an der Zehntausender-Stelle (ZT)?`,
          taskType: 'number',
          correctAnswer: zt,
          hint: 'Erinnere dich an die Reihenfolge von rechts nach links: Einer (E), Zehner (Z), Hunderter (H), Tausender (T), Zehntausender (ZT).',
          explanation: `In der Zahl ${formattedNum} steht ${zt} an der Zehntausender-Stelle (ZT), denn ${zt} · 10.000 = ${zt * 10000}.`,
          footballStory: `Im Stadion waren genau ${formattedNum} begeisterte Fußballfans!`
        };
      } else if (type === 1) {
        // Aus Text Zahl bilden
        const ht = Math.floor(Math.random() * 5) + 1;
        const t = Math.floor(Math.random() * 7) + 1;
        const h = Math.floor(Math.random() * 8) + 1;
        const e = Math.floor(Math.random() * 9) + 1;
        const total = ht * 100000 + t * 1000 + h * 100 + e;

        return {
          id: `sw_${randId}`,
          topicId: 'stellenwert',
          title: 'Zahl zusammensetzen',
          question: `Welche Zahl ist das: ${ht} HT + ${t} T + ${h} H + ${e} E?`,
          taskType: 'number',
          correctAnswer: total,
          hint: 'Achtung: Prüfe genau, ob alle Stellen da sind oder ob Nullen (z. B. bei ZT und Z) eingesetzt werden müssen!',
          explanation: `${ht} Hunderttausender (${ht * 100000}) + 0 Zehntausender (0) + ${t} Tausender (${t * 1000}) + ${h} Hunderter (${h * 100}) + 0 Zehner (0) + ${e} Einer = ${total.toLocaleString('de-DE')}.`,
          footballStory: `So viele Aufrufe hatte das Tor des Monats im Internet!`
        };
      } else {
        // Vorgänger und Nachfolger
        const base = (Math.floor(Math.random() * 80) + 10) * 1000;
        const isNachfolger = Math.random() > 0.5;
        const target = isNachfolger ? base + 1 : base - 1;

        return {
          id: `sw_${randId}`,
          topicId: 'stellenwert',
          title: isNachfolger ? 'Nachfolger finden' : 'Vorgänger finden',
          question: isNachfolger 
            ? `Wie lautet der Nachfolger (+1) der Zahl ${base.toLocaleString('de-DE')}?`
            : `Wie lautet der Vorgänger (-1) der Zahl ${base.toLocaleString('de-DE')}?`,
          taskType: 'number',
          correctAnswer: target,
          hint: isNachfolger ? 'Der Nachfolger ist genau um 1 größer.' : 'Der Vorgänger ist genau um 1 kleiner. Achte auf den Zehnerübergang bei den Nullen!',
          explanation: isNachfolger
            ? `${base.toLocaleString('de-DE')} + 1 = ${target.toLocaleString('de-DE')}.`
            : `${base.toLocaleString('de-DE')} - 1 = ${target.toLocaleString('de-DE')}.`
        };
      }
    }

    case 'runden': {
      const auf = Math.random() > 0.5 ? 'T' : 'H';
      if (auf === 'T') {
        const thousand = Math.floor(Math.random() * 40) + 10;
        const remainder = Math.floor(Math.random() * 900) + 50;
        const num = thousand * 1000 + remainder;
        const rounded = Math.round(num / 1000) * 1000;
        const hDigit = Math.floor(remainder / 100);

        return {
          id: `rd_${randId}`,
          topicId: 'runden',
          title: 'Auf Tausender (T) runden',
          question: `Runde die Zahl ${num.toLocaleString('de-DE')} auf Tausender (T):`,
          taskType: 'number',
          correctAnswer: rounded,
          hint: `Schau auf die Hunderter-Stelle (H): Das ist die Ziffer ${hDigit}. Bei 0, 1, 2, 3, 4 wird abgerundet. Bei 5, 6, 7, 8, 9 wird aufgerundet.`,
          explanation: `Die Hunderterziffer ist ${hDigit}. Daher wird ${hDigit >= 5 ? 'aufgerundet' : 'abgerundet'} zu ${rounded.toLocaleString('de-DE')}.`,
          footballStory: `Im Stadionbericht wird die Zuschauerzahl oft auf volle Tausender gerundet.`
        };
      } else {
        const h = Math.floor(Math.random() * 80) + 10;
        const remainder = Math.floor(Math.random() * 90) + 5;
        const num = h * 100 + remainder;
        const rounded = Math.round(num / 100) * 100;
        const zDigit = Math.floor(remainder / 10);

        return {
          id: `rd_${randId}`,
          topicId: 'runden',
          title: 'Auf Hunderter (H) runden',
          question: `Runde die Zahl ${num.toLocaleString('de-DE')} auf Hunderter (H):`,
          taskType: 'number',
          correctAnswer: rounded,
          hint: `Schau auf die Zehner-Stelle (Z): Das ist die Ziffer ${zDigit}. Gilt hier auf- oder abrunden?`,
          explanation: `Die Zehnerziffer ist ${zDigit}. Daher wird ${zDigit >= 5 ? 'aufgerundet' : 'abgerundet'} auf ${rounded.toLocaleString('de-DE')}.`
        };
      }
    }

    case 'schriftlich_plus_minus': {
      const isPlus = Math.random() > 0.4;
      if (isPlus) {
        const a = Math.floor(Math.random() * 45000) + 12000;
        const b = Math.floor(Math.random() * 38000) + 5000;
        const res = a + b;

        return {
          id: `spm_${randId}`,
          topicId: 'schriftlich_plus_minus',
          title: 'Schriftliche Addition',
          question: `Berechne: ${a.toLocaleString('de-DE')} + ${b.toLocaleString('de-DE')} =`,
          taskType: 'number',
          correctAnswer: res,
          hint: 'Rechne Stelle für Stelle von rechts nach links (Einer, Zehner, Hunderter, Tausender...). Notiere den Übertrag!',
          explanation: `Einer addieren, Zehner addieren... Ergebnis: ${a.toLocaleString('de-DE')} + ${b.toLocaleString('de-DE')} = ${res.toLocaleString('de-DE')}.`,
          footballStory: `Am Samstag kamen ${a.toLocaleString('de-DE')} Fans, am Sonntag ${b.toLocaleString('de-DE')} Fans.`
        };
      } else {
        const a = Math.floor(Math.random() * 60000) + 25000;
        const b = Math.floor(Math.random() * 20000) + 4000;
        const res = a - b;

        return {
          id: `spm_${randId}`,
          topicId: 'schriftlich_plus_minus',
          title: 'Schriftliche Subtraktion',
          question: `Berechne: ${a.toLocaleString('de-DE')} - ${b.toLocaleString('de-DE')} =`,
          taskType: 'number',
          correctAnswer: res,
          hint: 'Schreibe die Zahlen genau untereinander. Wenn die obere Ziffer kleiner ist als die untere, leihe dir einen Zehner (Übertrag 1).',
          explanation: `${a.toLocaleString('de-DE')} minus ${b.toLocaleString('de-DE')} ergibt ${res.toLocaleString('de-DE')}.`
        };
      }
    }

    case 'schriftlich_mal': {
      const isMultiDigit = Math.random() > 0.4;
      if (!isMultiDigit) {
        const a = Math.floor(Math.random() * 400) + 120;
        const b = Math.floor(Math.random() * 7) + 3;
        const res = a * b;

        return {
          id: `sm_${randId}`,
          topicId: 'schriftlich_mal',
          title: 'Schriftliche Multiplikation',
          question: `Berechne: ${a} · ${b} =`,
          taskType: 'number',
          correctAnswer: res,
          hint: `Rechne z. B. zuerst ${a} · ${b}: Multipliziere die Einer (${a % 10} · ${b}), die Zehner und die Hunderter.`,
          explanation: `${a} · ${b} = ${res}.`
        };
      } else {
        const a = Math.floor(Math.random() * 65) + 24;
        const b = Math.floor(Math.random() * 30) + 12;
        const res = a * b;

        return {
          id: `sm_${randId}`,
          topicId: 'schriftlich_mal',
          title: 'Multiplikation zweistellig',
          question: `Berechne das Produkt: ${a} · ${b} =`,
          taskType: 'number',
          correctAnswer: res,
          hint: `Zerlege den zweiten Faktor: Rechne zuerst ${a} · ${Math.floor(b / 10) * 10} und dann ${a} · ${b % 10}. Zähle beide Teilergebnisse zusammen!`,
          explanation: `${a} · ${Math.floor(b / 10) * 10} = ${a * Math.floor(b / 10) * 10}, und ${a} · ${b % 10} = ${a * (b % 10)}. Zusammen: ${res}.`,
          footballStory: `Ein Verein bestellt ${b} Trikotsätze für jeweils ${a} €.`
        };
      }
    }

    case 'schriftlich_geteilt': {
      const b = Math.floor(Math.random() * 7) + 3; // 3-9
      const quotient = Math.floor(Math.random() * 150) + 35;
      const remainder = Math.floor(Math.random() * (b - 1)); // 0 bis b-1
      const a = quotient * b + remainder;

      if (remainder === 0) {
        return {
          id: `sg_${randId}`,
          topicId: 'schriftlich_geteilt',
          title: 'Division ohne Rest',
          question: `Berechne den Quotienten: ${a} : ${b} =`,
          taskType: 'number',
          correctAnswer: quotient,
          hint: `Wie oft passt die ${b} in die ersten Ziffern von ${a}? Teile Schritt für Schritt von links nach rechts.`,
          explanation: `${a} : ${b} = ${quotient}, denn ${quotient} · ${b} = ${a}.`,
          footballStory: `${a} Fußbälle werden gleichmäßig auf ${b} Trainingsgruppen aufgeteilt.`
        };
      } else {
        return {
          id: `sg_${randId}`,
          topicId: 'schriftlich_geteilt',
          title: 'Division mit Rest',
          question: `Wie lautet das ganzzahlige Ergebnis (ohne Rest) von ${a} : ${b}?`,
          taskType: 'number',
          correctAnswer: quotient,
          hint: `Finde die größte Zahl unter ${a}, die glatt durch ${b} teilbar ist (${quotient * b}).`,
          explanation: `${a} : ${b} = ${quotient} Rest ${remainder}, denn ${quotient} · ${b} = ${quotient * b} (plus Rest ${remainder} = ${a}).`
        };
      }
    }

    case 'groessen_laengen': {
      const type = Math.floor(Math.random() * 3);
      if (type === 0) {
        // km und m in m
        const km = Math.floor(Math.random() * 12) + 2;
        const m = Math.floor(Math.random() * 850) + 50;
        const totalM = km * 1000 + m;

        return {
          id: `gl_${randId}`,
          topicId: 'groessen_laengen',
          title: 'Längen umrechnen (km → m)',
          question: `Wie viele Meter sind ${km} km ${m} m?`,
          taskType: 'number',
          unit: 'm',
          correctAnswer: totalM,
          hint: 'Denke an die Umrechnungszahl: 1 km hat genau 1.000 m.',
          explanation: `${km} km = ${km * 1000} m. Zusammen mit den ${m} m ergibt das: ${km * 1000} m + ${m} m = ${totalM} m.`,
          footballStory: `Ein Bundesliga-Mittelfeldspieler läuft pro Spiel stolze ${km} km ${m} m!`
        };
      } else if (type === 1) {
        // m in cm
        const m = Math.floor(Math.random() * 9) + 2;
        const cm = Math.floor(Math.random() * 80) + 10;
        const totalCm = m * 100 + cm;

        return {
          id: `gl_${randId}`,
          topicId: 'groessen_laengen',
          title: 'Längen umrechnen (m → cm)',
          question: `Wie viele Zentimeter sind ${m} m ${cm} cm?`,
          taskType: 'number',
          unit: 'cm',
          correctAnswer: totalCm,
          hint: '1 Meter hat 100 Zentimeter.',
          explanation: `${m} m = ${m * 100} cm. Plus ${cm} cm = ${totalCm} cm.`,
          footballStory: `Der Torwart hat eine Körpergröße von genau ${m} m ${cm} cm.`
        };
      } else {
        // cm in mm
        const cm = Math.floor(Math.random() * 45) + 12;
        const totalMm = cm * 10;

        return {
          id: `gl_${randId}`,
          topicId: 'groessen_laengen',
          title: 'Längen umrechnen (cm → mm)',
          question: `Wie viele Millimeter sind ${cm} cm?`,
          taskType: 'number',
          unit: 'mm',
          correctAnswer: totalMm,
          hint: '1 cm = 10 mm. Hänge einfach eine Null an!',
          explanation: `${cm} · 10 = ${totalMm} mm.`
        };
      }
    }

    case 'groessen_gewichte_geld': {
      const isWeight = Math.random() > 0.4;
      if (isWeight) {
        const kg = Math.floor(Math.random() * 8) + 2;
        const g = Math.floor(Math.random() * 700) + 100;
        const totalG = kg * 1000 + g;

        return {
          id: `gg_${randId}`,
          topicId: 'groessen_gewichte_geld',
          title: 'Gewichte umrechnen (kg → g)',
          question: `Wie viele Gramm sind ${kg} kg ${g} g?`,
          taskType: 'number',
          unit: 'g',
          correctAnswer: totalG,
          hint: '1 Kilogramm (kg) entspricht genau 1.000 Gramm (g).',
          explanation: `${kg} kg = ${kg * 1000} g. Zusammen: ${kg * 1000} + ${g} = ${totalG} g.`,
          footballStory: `Die Sporttasche mit den Trainingsbällen wiegt ${kg} kg ${g} g.`
        };
      } else {
        const euro = Math.floor(Math.random() * 40) + 15;
        const cent = Math.floor(Math.random() * 80) + 10;
        const totalCent = euro * 100 + cent;

        return {
          id: `gg_${randId}`,
          topicId: 'groessen_gewichte_geld',
          title: 'Geld umrechnen (€ → ct)',
          question: `Wie viele Cent sind ${euro} € ${cent} ct?`,
          taskType: 'number',
          unit: 'ct',
          correctAnswer: totalCent,
          hint: '1 Euro entspricht 100 Cent.',
          explanation: `${euro} € = ${euro * 100} ct. Plus ${cent} ct = ${totalCent} ct.`,
          footballStory: `Ein Stadionticket und ein Getränk kosten zusammen ${euro} € ${cent} ct.`
        };
      }
    }

    case 'groessen_zeit': {
      const type = Math.random() > 0.5 ? 'h_to_min' : 'min_to_s';
      if (type === 'h_to_min') {
        const h = Math.floor(Math.random() * 3) + 1;
        const min = Math.floor(Math.random() * 50) + 5;
        const totalMin = h * 60 + min;

        return {
          id: `gz_${randId}`,
          topicId: 'groessen_zeit',
          title: 'Zeitspannen umrechnen (h → min)',
          question: `Wie viele Minuten sind ${h} h ${min} min?`,
          taskType: 'number',
          unit: 'min',
          correctAnswer: totalMin,
          hint: 'Achtung: Eine Stunde hat 60 Minuten (nicht 100!). Rechne ${h} · 60.',
          explanation: `${h} h = ${h * 60} min. Plus ${min} min = ${totalMin} min.`,
          footballStory: `Das gesamte Spiel inklusive Pause und Verlängerung dauerte ${h} h ${min} min.`
        };
      } else {
        const min = Math.floor(Math.random() * 8) + 2;
        const totalS = min * 60;

        return {
          id: `gz_${randId}`,
          topicId: 'groessen_zeit',
          title: 'Zeitspannen umrechnen (min → s)',
          question: `Wie viele Sekunden sind ${min} Minuten?`,
          taskType: 'number',
          unit: 's',
          correctAnswer: totalS,
          hint: '1 Minute hat 60 Sekunden. Multipliziere mit 60!',
          explanation: `${min} · 60 s = ${totalS} s.`,
          footballStory: `Der Schiedsrichter zeigt ${min} Minuten Nachspielzeit an!`
        };
      }
    }

    case 'geometrie': {
      const isUmfang = Math.random() > 0.5;
      if (isUmfang) {
        // Umfang eines Rechtecks U = 2*(a+b)
        const a = Math.floor(Math.random() * 15) + 10;
        const b = Math.floor(Math.random() * 8) + 4;
        const umfang = 2 * (a + b);

        return {
          id: `geo_${randId}`,
          topicId: 'geometrie',
          title: 'Umfang des Rechtecks berechnen',
          question: `Ein Trainingsfeld hat die Länge a = ${a} m und die Breite b = ${b} m. Berechne den Umfang U:`,
          taskType: 'number',
          unit: 'm',
          correctAnswer: umfang,
          hint: 'Die Formel für den Umfang eines Rechtecks lautet: U = 2 · (a + b) oder a + b + a + b.',
          explanation: `U = 2 · (${a} m + ${b} m) = 2 · ${a + b} m = ${umfang} m.`,
          footballStory: `Die Spieler laufen beim Aufwärmen einmal ganz um das Feld herum.`
        };
      } else {
        // Flächeninhalt A = a * b
        const a = Math.floor(Math.random() * 12) + 5;
        const b = Math.floor(Math.random() * 7) + 3;
        const flaeche = a * b;

        return {
          id: `geo_${randId}`,
          topicId: 'geometrie',
          title: 'Flächeninhalt des Rechtecks berechnen',
          question: `Ein Torraum ist a = ${a} m lang und b = ${b} m breit. Wie groß ist der Flächeninhalt A?`,
          taskType: 'number',
          unit: 'm²',
          correctAnswer: flaeche,
          hint: 'Die Formel für den Flächeninhalt lautet: A = a · b (Länge mal Breite).',
          explanation: `A = ${a} m · ${b} m = ${flaeche} m².`
        };
      }
    }

    case 'sachaufgaben_fussball': {
      const stories = [
        () => {
          const kapazitaet = 65000;
          const besetzt = Math.floor(Math.random() * 15000) + 45000;
          const frei = kapazitaet - besetzt;
          return {
            title: 'Stadion-Zuschauer',
            question: `Ein Stadion hat insgesamt 65.000 Plätze. Zum Spitzenspiel sind ${besetzt.toLocaleString('de-DE')} Plätze besetzt. Wie viele Plätze bleiben frei?`,
            ans: frei,
            unit: 'Plätze',
            hint: 'Frage: Wie viele Plätze sind frei? Rechnung: Gesamtzahl minus besetzte Plätze.',
            exp: `Rechnung: 65.000 - ${besetzt.toLocaleString('de-DE')} = ${frei.toLocaleString('de-DE')} freie Plätze.`
          };
        },
        () => {
          const tickets = Math.floor(Math.random() * 4) + 3;
          const preis = Math.floor(Math.random() * 15) + 25;
          const gesamt = tickets * preis;
          return {
            title: 'Ticket-Verkauf',
            question: `Ein Fußballverein verkauft ${tickets} Eintrittskarten für jeweils ${preis} €. Wie viel Euro nimmt der Verein ein?`,
            ans: gesamt,
            unit: '€',
            hint: 'Frage: Gesamteinnahmen? Rechnung: Anzahl der Tickets mal Preis pro Ticket.',
            exp: `Rechnung: ${tickets} · ${preis} € = ${gesamt} €.`
          };
        },
        () => {
          const punkteAlt = Math.floor(Math.random() * 15) + 30;
          const siege = Math.floor(Math.random() * 5) + 2;
          const punkteNeu = punkteAlt + siege * 3;
          return {
            title: 'Punkte in der Tabelle',
            question: `Ein Team hat aktuell ${punkteAlt} Punkte. In den nächsten Spielen holt die Mannschaft ${siege} Siege (für jeden Sieg gibt es 3 Punkte). Wie viele Punkte hat das Team danach?`,
            ans: punkteNeu,
            unit: 'Punkte',
            hint: 'Berechne zuerst, wie viele Punkte die Siege bringen (${siege} · 3 Punkte). Addiere das zu den bisherigen Punkten!',
            exp: `Für ${siege} Siege gibt es ${siege} · 3 = ${siege * 3} Punkte. Vorher: ${punkteAlt}. Danach: ${punkteAlt} + ${siege * 3} = ${punkteNeu} Punkte.`
          };
        }
      ];

      const chosen = stories[Math.floor(Math.random() * stories.length)]();
      return {
        id: `sach_${randId}`,
        topicId: 'sachaufgaben_fussball',
        title: chosen.title,
        question: chosen.question,
        taskType: 'number',
        correctAnswer: chosen.ans,
        unit: chosen.unit,
        hint: chosen.hint,
        explanation: chosen.exp,
        footballStory: 'Echte Bundesliga-Aufgabe aus der Sportwelt!'
      };
    }
  }
}
