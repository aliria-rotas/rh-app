-- Insert 26 campanhas únicas (sem duplicatas)
INSERT INTO public.rh_endomarketing_campaigns (id, title, type, status, description, target_audience, channels, start_date, end_date, created_at, updated_at)
VALUES
  ('6fe47a8f-0001-0001-0001-000000000001', 'Newsletter Junho 2026', 'comunicado', 'planejada', 'Boletim informativo mensal', 'Toda a equipe', '["E-mail","Newsletter"]', '2026-06-01', '2026-06-30', NOW(), NOW()),
  ('6fe47a8f-0002-0002-0002-000000000002', 'Newsletter Julho 2026', 'comunicado', 'planejada', 'Boletim informativo mensal', 'Toda a equipe', '["E-mail","Newsletter"]', '2026-07-01', '2026-07-31', NOW(), NOW()),
  ('6fe47a8f-0003-0003-0003-000000000003', 'Junho Vermelho — Doação de Sangue', 'campanha', 'planejada', 'Uma gota vermelha pode salvar uma vida', 'Toda a equipe', '["WhatsApp (grupo)","E-mail","Reunião presencial"]', '2026-06-01', '2026-06-30', NOW(), NOW()),
  ('6fe47a8f-0004-0004-0004-000000000004', 'Julho Amarelo — Hepatites Virais', 'campanha', 'planejada', 'Hepatite não é piada', 'Toda a equipe', '["E-mail","Mural físico/digital","Reunião presencial"]', '2026-07-01', '2026-07-31', NOW(), NOW()),
  ('6fe47a8f-0005-0005-0005-000000000005', 'Julho Verde — Câncer de Cabeça e Pescoço', 'campanha', 'planejada', 'Detecção precoce salva', 'Toda a equipe', '["WhatsApp (grupo)","E-mail","Mural físico/digital"]', '2026-07-01', '2026-07-31', NOW(), NOW()),
  ('6fe47a8f-0006-0006-0006-000000000006', 'Agosto Lilás — Prevenção à Violência Contra a Mulher', 'campanha', 'planejada', 'Não é amor. É violência', 'Toda a equipe', '["WhatsApp (grupo)","E-mail","Mural físico/digital","Reunião presencial"]', '2026-08-01', '2026-08-31', NOW(), NOW());
