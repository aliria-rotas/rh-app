-- Limpar dados das tabelas para que o seed execute novamente
DELETE FROM rh_competencies;
DELETE FROM rh_positions;
DELETE FROM rh_climate_surveys;
DELETE FROM rh_job_openings;
DELETE FROM rh_trainings;
DELETE FROM rh_endomarketing_campaigns;
DELETE FROM rh_salary_grades;
DELETE FROM rh_performance_cycles;

-- O seed será executado automaticamente na próxima inicialização do app
