-- Supabase Schema für Waidmanns Wort
-- Führe dieses SQL in deinem Supabase Dashboard unter SQL Editor aus

-- Tabelle für Artikel-Titel (noch nicht generierte Artikel)
CREATE TABLE article_titles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_generated BOOLEAN DEFAULT FALSE
);

-- Tabelle für generierte Artikel
CREATE TABLE articles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title_id UUID REFERENCES article_titles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index für schnellere Abfragen
CREATE INDEX idx_article_titles_is_generated ON article_titles(is_generated);
CREATE INDEX idx_article_titles_category ON article_titles(category);
CREATE INDEX idx_articles_title_id ON articles(title_id);

-- Row Level Security aktivieren
ALTER TABLE article_titles ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Policies: Jeder kann lesen
CREATE POLICY "Allow public read access on article_titles"
    ON article_titles FOR SELECT
    USING (true);

CREATE POLICY "Allow public read access on articles"
    ON articles FOR SELECT
    USING (true);

-- Policies: Nur mit Service Role Key schreiben (für API)
CREATE POLICY "Allow service role insert on article_titles"
    ON article_titles FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow service role update on article_titles"
    ON article_titles FOR UPDATE
    USING (true);

CREATE POLICY "Allow service role insert on articles"
    ON articles FOR INSERT
    WITH CHECK (true);

-- Beispiel-Titel zum Starten (optional)
INSERT INTO article_titles (title, description, category) VALUES
('Der Rehbock im Frühjahr - Verhaltensbeobachtungen aus 35 Jahren',
 'Meine Erfahrungen mit dem Verhalten des Rehbocks während der Frühjahrszeit',
 'wild'),
('Die Blaser R8 - Ein ehrlicher Erfahrungsbericht nach 10 Jahren',
 'Warum ich mich damals für die R8 entschieden habe und wie sie sich bewährt hat',
 'waffen'),
('Welcher Geländewagen fürs Revier? Mein Vergleich',
 'Von Land Rover bis Toyota - welche Fahrzeuge sich für den Reviergang eignen',
 'fahrzeuge'),
('Die Eiche im Jagdrevier - Mehr als nur ein Baum',
 'Über die Bedeutung der Eiche für Wild und Jäger',
 'wald'),
('Mein treuer Begleiter - 12 Jahre mit meinem Deutsch Drahthaar',
 'Eine Liebeserklärung an meinen Jagdhund Arko',
 'hunde');
