-- Fix search_path for calculate_power function
CREATE OR REPLACE FUNCTION public.calculate_power(
  p_strength INTEGER,
  p_defense INTEGER,
  p_vitality INTEGER,
  p_agility INTEGER,
  p_luck INTEGER,
  p_level INTEGER
)
RETURNS INTEGER AS $$
BEGIN
  RETURN (p_strength * 3 + p_defense * 2 + p_vitality * 2 + p_agility * 2 + p_luck) * p_level;
END;
$$ LANGUAGE plpgsql IMMUTABLE SET search_path = public;