-- Políticas para rh_employees
CREATE POLICY "Users can read their own employee data" 
  ON rh_employees FOR SELECT 
  USING (auth.uid()::text = id OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Only admin can update employee data" 
  ON rh_employees FOR UPDATE 
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Only admin can insert employees" 
  ON rh_employees FOR INSERT 
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Only admin can delete employees" 
  ON rh_employees FOR DELETE 
  USING (auth.jwt() ->> 'role' = 'admin');
