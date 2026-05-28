-- Políticas para rh_benefits_config
CREATE POLICY "Only admin can read benefits config" 
  ON rh_benefits_config FOR SELECT 
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Only admin can update benefits config" 
  ON rh_benefits_config FOR UPDATE 
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Only admin can insert benefits config" 
  ON rh_benefits_config FOR INSERT 
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');
