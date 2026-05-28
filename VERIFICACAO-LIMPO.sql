SELECT schemaname, tablename, policyname, qual, with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('rh_employees', 'rh_benefits_config', 'rh_job_openings', 'rh_interview_questions')
ORDER BY tablename, policyname;
