-- Políticas para rh_interview_questions
CREATE POLICY "Authenticated users can read interview questions" 
  ON rh_interview_questions FOR SELECT 
  USING (auth.jwt() ->> 'sub' IS NOT NULL);

CREATE POLICY "Only admin can update interview questions" 
  ON rh_interview_questions FOR UPDATE 
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Only admin can insert interview questions" 
  ON rh_interview_questions FOR INSERT 
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');
