-- Run this once in your Vercel Postgres dashboard (or psql)
-- to set up the database schema and seed data.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS messages (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  emotion      TEXT NOT NULL,
  recipient    TEXT,
  content      TEXT NOT NULL,
  section      TEXT NOT NULL DEFAULT 'general',
  approved     BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  react_relate    INTEGER NOT NULL DEFAULT 0,
  react_support   INTEGER NOT NULL DEFAULT 0,
  react_strong    INTEGER NOT NULL DEFAULT 0,
  react_notalone  INTEGER NOT NULL DEFAULT 0,
  CHECK (emotion  IN ('Anxiety','Loneliness','Hope','Heartbreak','Stress','Gratitude','Self-Doubt','Other')),
  CHECK (section  IN ('general','midnight','hope'))
);

CREATE INDEX IF NOT EXISTS idx_messages_section    ON messages(section);
CREATE INDEX IF NOT EXISTS idx_messages_emotion    ON messages(emotion);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_approved   ON messages(approved);

-- Seed data
INSERT INTO messages (emotion, recipient, content, section, react_relate, react_support, react_strong, react_notalone) VALUES
('Loneliness', 'You',               'I keep replaying conversations in my head, wondering if I said the right things. It''s 2am and I can''t stop thinking about all the ways I might have pushed people away.',                                                section, 'midnight', 14, 8,  11, 19),
('Hope',       NULL,                'Six months ago I couldn''t get out of bed. Today I made breakfast, went for a walk, and called my mom. Small steps are still steps forward.',                                                                           'hope',    22, 15, 30, 18),
('Anxiety',    'Past Me',           'You survived every bad day so far. 100% success rate. Stop forgetting that.',                                                                                                                                           'general', 9,  7,  12, 14),
('Heartbreak', 'Him',               'I still check your Instagram even though we haven''t spoken in two years. I don''t miss you anymore, I just miss who I was when I was with you.',                                                                       'midnight', 31, 12, 8,  25),
('Gratitude',  'My therapist',      'You told me feelings aren''t facts. I think about that every single day now. Thank you for giving me language for the chaos in my head.',                                                                               'hope',    18, 20, 14, 16),
('Self-Doubt', NULL,                'I got the promotion. Three years of thinking I wasn''t good enough, and I got it. I''m still waiting to feel like I deserve it.',                                                                                       'hope',    26, 19, 22, 28),
('Stress',     'Anyone who gets it','Burnout is real and it crept up so slowly I didn''t notice until I was crying in my car before work every single morning.',                                                                                             'midnight', 37, 29, 21, 41),
('Loneliness', NULL,                'I have a full life on paper. Friends, a job, hobbies. And yet some nights it feels like I''m screaming into a void and no one can hear me.',                                                                            'general', 24, 17, 13, 29),
('Hope',       'Future me',         'Today I finally asked for help. It was the hardest sentence I have ever said out loud. But I said it. And the world didn''t end.',                                                                                      'hope',    44, 38, 51, 47),
('Anxiety',    NULL,                'My brain treats every unanswered text like an emergency. Every silence like abandonment. I''m trying to learn the difference between a feeling and a fact.',                                                             'midnight', 33, 21, 18, 36);
