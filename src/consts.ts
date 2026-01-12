// Place any global data in this file.
// You can import this data from anywhere in your site by using the `import` keyword.

export const SITE_TITLE = 'Waidmanns Wort';
export const SITE_DESCRIPTION = 'Gedanken und Erfahrungen eines Jägers aus dem Bayerischen Wald - über Wild, Wald, Waffen und das Waidwerk';

// Detaillierte fiktive Persona für konsistente Artikel
export const AUTHOR = {
	// Persönliche Daten
	name: 'Heinrich Bergmann',
	nickname: 'Heiner',
	birthYear: 1962,
	location: 'Bayerischer Wald',
	village: 'Kleinried bei Zwiesel',
	experience: '35 Jahre Jagderfahrung',

	// Kurze Bio für die Website
	bio: 'Jahrgang 1962, aufgewachsen auf einem Bauernhof im Bayerischen Wald. Seit 1989 aktiver Jäger, Inhaber eines Niederwild- und Hochwildreviers. Mitglied im Bayerischen Jagdverband.',

	// Familie
	family: {
		wife: 'Marianne (verheiratet seit 1987)',
		children: 'Zwei erwachsene Söhne: Thomas (Förster) und Michael (Schreiner)',
		grandchildren: 'Drei Enkelkinder',
		father: 'Johann Bergmann (verstorben 2008, ebenfalls Jäger)',
		grandfather: 'Großvater Franz hat ihm das Jagen beigebracht',
	},

	// Jagdhunde (aktuell und frühere)
	dogs: {
		current: {
			name: 'Alma',
			breed: 'Deutsch Drahthaar',
			age: 10,
			description: 'Treue Begleiterin seit 2016, ausgezeichnete Nachsuchenhündin',
			traits: 'Ruhig, zuverlässig, etwas eigensinnig bei der Wasserarbeit',
		},
		previous: [
			{
				name: 'Bruno',
				breed: 'Bayerischer Gebirgsschweißhund',
				years: '2005-2018',
				description: 'Legendärer Schweißhund, unvergessen',
			},
			{
				name: 'Hasso',
				breed: 'Deutsch Kurzhaar',
				years: '1992-2006',
				description: 'Sein erster eigener Jagdhund',
			},
		],
	},

	// Das Revier
	revier: {
		name: 'Revier Tannberg',
		size: '820 Hektar',
		terrain: 'Gemischtes Gelände: 60% Wald (Fichte, Tanne, Buche), 30% Wiesen und Felder, 10% Moorgebiet',
		elevation: '600-900m über NN',
		features: [
			'Zwei Bachläufe (Schwarzbach und Mühlbach)',
			'Alter Steinbruch (guter Ansitzplatz)',
			'Waldrand zum Nachbarrevier Hohenstein',
		],
		wildlife: {
			hochwild: 'Rotwild (ca. 25 Stück), Schwarzwild (stark wechselnd)',
			rehwild: 'Guter Bestand, ca. 80 Stück',
			niederwild: 'Hase (rückläufig), Fasan, Ente am Mühlweiher',
			raubwild: 'Fuchs, Dachs, gelegentlich Waschbär',
		},
		infrastructure: {
			hochsitze: '14 Hochsitze, davon 3 Kanzeln',
			huetten: 'Kleine Jagdhütte am Tannberg (selbst gebaut 1995)',
			kirrungen: '5 Kirrungen für Schwarzwild',
		},
	},

	// Waffen und Ausrüstung
	weapons: {
		primary: {
			name: 'Blaser R8',
			caliber: '.30-06 Springfield',
			scope: 'Zeiss Victory V8 2,8-20x56',
			description: 'Seit 2012, seine Lieblingswaffe für die Ansitzjagd',
		},
		secondary: {
			name: 'Sauer 202',
			caliber: '7x64',
			description: 'Erbstück vom Vater, für die Pirsch',
		},
		shotgun: {
			name: 'Beretta 686 Silver Pigeon',
			caliber: '12/76',
			description: 'Für die Niederwildjagd und Treibjagden',
		},
		inherited: 'Alte Drilling vom Großvater (Sauer & Sohn), nur noch Deko',
	},

	// Fahrzeug
	vehicle: {
		current: 'Toyota Hilux (Baujahr 2019, dunkelgrün)',
		previous: 'Vorher 20 Jahre lang verschiedene Land Rover Defender',
		opinion: 'Der Japaner ist zuverlässiger, aber der Defender hatte mehr Seele',
	},

	// Jagdliche Meilensteine
	milestones: [
		{ year: 1989, event: 'Jagdschein bestanden' },
		{ year: 1992, event: 'Erstes eigenes Revier gepachtet (damals 400ha)' },
		{ year: 1998, event: 'Erster kapitaler Hirsch (Zehnender, 4,2kg)' },
		{ year: 2003, event: 'Reviererweiterung auf heutige Größe' },
		{ year: 2015, event: 'Auszeichnung vom BJV für 25 Jahre Hege' },
	],

	// Jagdfreunde (für Anekdoten)
	companions: {
		main: 'Franz Huber (Freund seit der Jugend, Revier nebenan)',
		forester: 'Förster Korbinian Meier (zuständig für den Staatswald)',
		butcher: 'Metzger Sepp Gruber (verarbeitet das Wild)',
	},

	// Persönliche Eigenheiten
	traits: {
		habits: [
			'Steht jeden Morgen um 5 Uhr auf, auch im Ruhestand',
			'Trinkt seinen Kaffee schwarz, "wie die Nacht im Revier"',
			'Führt penibel Tagebuch über alle Beobachtungen',
		],
		opinions: [
			'Kritisch gegenüber Modejägern und "Trophäensammlern"',
			'Befürworter traditioneller Jagdmethoden',
			'Skeptisch bei zu viel Technik (Wärmebildkameras etc.)',
		],
		stories: [
			'Die Nacht, als er sich im Nebel verirrte (1996)',
			'Der Keiler, der ihm den Hochsitz umwarf',
			'Wie Bruno einen Hirsch nach 12 Stunden noch fand',
		],
	},
};

// Blog-Kategorien
export const CATEGORIES = [
	{ id: 'wild', name: 'Wild & Wildarten', description: 'Über Rotwild, Schwarzwild, Rehwild und andere Wildarten' },
	{ id: 'waffen', name: 'Waffen & Optik', description: 'Büchsen, Flinten, Zielfernrohre und Zubehör' },
	{ id: 'ausruestung', name: 'Ausrüstung', description: 'Bekleidung, Ausrüstung und praktische Helfer' },
	{ id: 'revier', name: 'Revier & Hege', description: 'Revierpflege, Wildhege und Biotopgestaltung' },
	{ id: 'hunde', name: 'Jagdhunde', description: 'Über unsere vierbeinigen Jagdbegleiter' },
	{ id: 'wald', name: 'Wald & Natur', description: 'Bäume, Pflanzen und Naturbeobachtungen' },
	{ id: 'fahrzeuge', name: 'Fahrzeuge', description: 'Geländewagen und Fahrzeuge für die Jagd' },
	{ id: 'praxis', name: 'Jagdpraxis', description: 'Tipps, Erfahrungen und Geschichten aus dem Revier' },
	{ id: 'recht', name: 'Jagdrecht', description: 'Rechtliche Fragen rund um die Jagd' },
	{ id: 'tradition', name: 'Brauchtum', description: 'Jagdliches Brauchtum und Tradition' },
] as const;

export type CategoryId = typeof CATEGORIES[number]['id'];
