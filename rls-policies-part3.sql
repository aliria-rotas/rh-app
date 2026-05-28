-- Políticas para rh_job_openings
CREATE POLICY "Anyone can read open job openings" 
  ON rh_job_openings FOR SELECT 
  USING (status = 'open' OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Only admin can update job openings" 
  ON rh_job_openings FOR UPDATE 
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Only admin can insert job openings" 
  ON rh_job_openings FOR INSERT 
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');
