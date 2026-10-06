insert into public.series (title, slug, short_description, description, category, genre, cover_url, banner_url, thumbnail_url, age_rating, status, featured, sort_order, published_at)
values
  ('My Queen, My Rules', 'my-queen-my-rules', 'Um romance intenso entre poder, desejo e escolhas impossíveis.', 'Uma história de romance e tensão para abrir o catálogo Feed Loves.', 'Dramas', 'Romance', '/assets/poster1.jpg', '/assets/poster1.jpg', '/assets/poster1.jpg', '14', 'published', true, 1, now()),
  ('A Hipótese do Amor', 'a-hipotese-do-amor', 'Quando a razão tenta controlar o coração.', 'Uma novelinha leve, romântica e perfeita para maratonar.', 'Novelinhas', 'Romance', '/assets/poster5.jpg', '/assets/poster5.jpg', '/assets/poster5.jpg', '12', 'published', false, 2, now()),
  ('Istanbul Gelin', 'istanbul-gelin', 'Segredos de família, paixão e recomeços.', 'Uma série turca marcada por escolhas difíceis e grandes emoções.', 'Séries Turcas', 'Drama', '/assets/poster6.jpg', '/assets/poster6.jpg', '/assets/poster6.jpg', '14', 'published', false, 3, now()),
  ('O Canto do Pássaro', 'o-canto-do-passaro', 'Uma paixão que desafia todas as regras.', 'Romance, família e reviravoltas em uma história turca envolvente.', 'Séries Turcas', 'Romance', '/assets/poster7.jpg', '/assets/poster7.jpg', '/assets/poster7.jpg', '14', 'published', false, 4, now()),
  ('Mükemmel Aşk', 'mukemmel-ask', 'O amor perfeito pode esconder as maiores surpresas.', 'Uma comédia romântica turca para assistir sem pressa.', 'Séries Turcas', 'Comédia romântica', '/assets/poster4.jpg', '/assets/poster4.jpg', '/assets/poster4.jpg', '12', 'published', false, 5, now()),
  ('Dolunay', 'dolunay', 'Entre encontros inesperados e uma nova chance para amar.', 'Uma história turca de romance, sonhos e encontros marcantes.', 'Séries Turcas', 'Romance', '/assets/poster2.jpg', '/assets/poster2.jpg', '/assets/poster2.jpg', '12', 'published', false, 6, now()),
  ('Primavera Antecipada', 'primavera-antecipada', 'Alguns encontros chegam antes da hora certa.', 'Uma história delicada sobre desejo, coragem e novas possibilidades.', 'Dramas', 'Romance', '/assets/poster8.jpg', '/assets/poster8.jpg', '/assets/poster8.jpg', '14', 'published', false, 7, now()),
  ('Entre Dois Destinos', 'entre-dois-destinos', 'Um amor dividido entre passado e futuro.', 'Um drama histórico para quem gosta de histórias intensas e cinematográficas.', 'Dramas', 'Drama histórico', '/assets/poster3.jpg', '/assets/poster3.jpg', '/assets/poster3.jpg', '14', 'published', false, 8, now())
on conflict (slug) do update set
  title = excluded.title,
  short_description = excluded.short_description,
  description = excluded.description,
  category = excluded.category,
  genre = excluded.genre,
  cover_url = excluded.cover_url,
  banner_url = excluded.banner_url,
  thumbnail_url = excluded.thumbnail_url,
  age_rating = excluded.age_rating,
  status = excluded.status,
  featured = excluded.featured,
  sort_order = excluded.sort_order,
  published_at = excluded.published_at,
  updated_at = now();
