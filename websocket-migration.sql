-- Create a function to notify about player changes
CREATE OR REPLACE FUNCTION notify_player_changes()
RETURNS TRIGGER AS $$
DECLARE
  payload JSON;
BEGIN
  -- Create a JSON payload with the player ID, game ID, and change type
  payload := json_build_object(
    'playerId', NEW.id,
    'gameId', NEW.game_id,
    'changeType', TG_OP,
    'timestamp', CURRENT_TIMESTAMP
  );
  
  -- Send notification
  PERFORM pg_notify('player_changes', payload::text);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS player_changes_trigger ON players;
DROP TRIGGER IF EXISTS player_items_changes_trigger ON player_items;
DROP TRIGGER IF EXISTS player_spells_changes_trigger ON player_spells;
DROP TRIGGER IF EXISTS player_lootboxes_changes_trigger ON player_lootboxes;
DROP TRIGGER IF EXISTS player_equipped_items_changes_trigger ON player_equipped_items;

-- Create trigger for player table changes
CREATE TRIGGER player_changes_trigger
AFTER INSERT OR UPDATE OR DELETE ON players
FOR EACH ROW
EXECUTE FUNCTION notify_player_changes();

-- Fix for direct SQL updates: Add a statement-level trigger
CREATE OR REPLACE FUNCTION notify_player_changes_statement()
RETURNS TRIGGER AS $$
DECLARE
  player_record RECORD;
  payload JSON;
BEGIN
  -- For statement-level triggers, we need to iterate through affected rows
  IF TG_OP = 'UPDATE' THEN
    FOR player_record IN SELECT * FROM new_table LOOP
      payload := json_build_object(
        'playerId', player_record.id,
        'gameId', player_record.game_id,
        'changeType', TG_OP,
        'timestamp', CURRENT_TIMESTAMP
      );
      PERFORM pg_notify('player_changes', payload::text);
    END LOOP;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Add statement-level trigger for bulk updates
DROP TRIGGER IF EXISTS player_changes_statement_trigger ON players;
CREATE TRIGGER player_changes_statement_trigger
AFTER UPDATE ON players
REFERENCING NEW TABLE AS new_table
FOR EACH STATEMENT
EXECUTE FUNCTION notify_player_changes_statement();

-- Create a function to notify about player items changes
CREATE OR REPLACE FUNCTION notify_player_items_changes()
RETURNS TRIGGER AS $$
DECLARE
  payload JSON;
  game_id_val TEXT;
BEGIN
  -- Get the game_id for the player
  IF TG_OP = 'DELETE' THEN
    SELECT game_id INTO game_id_val FROM players WHERE id = OLD.player_id;
  ELSE
    SELECT game_id INTO game_id_val FROM players WHERE id = NEW.player_id;
  END IF;

  -- Create a JSON payload with the player ID, game ID, and change type
  payload := json_build_object(
    'playerId', CASE WHEN TG_OP = 'DELETE' THEN OLD.player_id ELSE NEW.player_id END,
    'gameId', game_id_val,
    'changeType', TG_OP,
    'table', 'player_items',
    'itemId', CASE WHEN TG_OP = 'DELETE' THEN OLD.item_id ELSE NEW.item_id END,
    'timestamp', CURRENT_TIMESTAMP
  );
  
  -- Send notification
  PERFORM pg_notify('player_changes', payload::text);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for player_items table changes
CREATE TRIGGER player_items_changes_trigger
AFTER INSERT OR UPDATE OR DELETE ON player_items
FOR EACH ROW
EXECUTE FUNCTION notify_player_items_changes();

-- Create a function to notify about player spells changes
CREATE OR REPLACE FUNCTION notify_player_spells_changes()
RETURNS TRIGGER AS $$
DECLARE
  payload JSON;
  game_id_val TEXT;
BEGIN
  -- Get the game_id for the player
  IF TG_OP = 'DELETE' THEN
    SELECT game_id INTO game_id_val FROM players WHERE id = OLD.player_id;
  ELSE
    SELECT game_id INTO game_id_val FROM players WHERE id = NEW.player_id;
  END IF;

  -- Create a JSON payload with the player ID, game ID, and change type
  payload := json_build_object(
    'playerId', CASE WHEN TG_OP = 'DELETE' THEN OLD.player_id ELSE NEW.player_id END,
    'gameId', game_id_val,
    'changeType', TG_OP,
    'table', 'player_spells',
    'spellId', CASE WHEN TG_OP = 'DELETE' THEN OLD.spell_id ELSE NEW.spell_id END,
    'timestamp', CURRENT_TIMESTAMP
  );
  
  -- Send notification
  PERFORM pg_notify('player_changes', payload::text);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for player_spells table changes
CREATE TRIGGER player_spells_changes_trigger
AFTER INSERT OR UPDATE OR DELETE ON player_spells
FOR EACH ROW
EXECUTE FUNCTION notify_player_spells_changes();

-- Create a function to notify about player lootboxes changes
CREATE OR REPLACE FUNCTION notify_player_lootboxes_changes()
RETURNS TRIGGER AS $$
DECLARE
  payload JSON;
  game_id_val TEXT;
BEGIN
  -- Get the game_id for the player
  IF TG_OP = 'DELETE' THEN
    SELECT game_id INTO game_id_val FROM players WHERE id = OLD.player_id;
  ELSE
    SELECT game_id INTO game_id_val FROM players WHERE id = NEW.player_id;
  END IF;

  -- Create a JSON payload with the player ID, game ID, and change type
  payload := json_build_object(
    'playerId', CASE WHEN TG_OP = 'DELETE' THEN OLD.player_id ELSE NEW.player_id END,
    'gameId', game_id_val,
    'changeType', TG_OP,
    'table', 'player_lootboxes',
    'lootboxId', CASE WHEN TG_OP = 'DELETE' THEN OLD.lootbox_id ELSE NEW.lootbox_id END,
    'timestamp', CURRENT_TIMESTAMP
  );
  
  -- Send notification
  PERFORM pg_notify('player_changes', payload::text);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for player_lootboxes table changes
CREATE TRIGGER player_lootboxes_changes_trigger
AFTER INSERT OR UPDATE OR DELETE ON player_lootboxes
FOR EACH ROW
EXECUTE FUNCTION notify_player_lootboxes_changes();

-- Create a function to notify about player equipped items changes
CREATE OR REPLACE FUNCTION notify_player_equipped_items_changes()
RETURNS TRIGGER AS $$
DECLARE
  payload JSON;
  game_id_val TEXT;
BEGIN
  -- Get the game_id for the player
  IF TG_OP = 'DELETE' THEN
    SELECT game_id INTO game_id_val FROM players WHERE id = OLD.player_id;
  ELSE
    SELECT game_id INTO game_id_val FROM players WHERE id = NEW.player_id;
  END IF;

  -- Create a JSON payload with the player ID, game ID, and change type
  payload := json_build_object(
    'playerId', CASE WHEN TG_OP = 'DELETE' THEN OLD.player_id ELSE NEW.player_id END,
    'gameId', game_id_val,
    'changeType', TG_OP,
    'table', 'player_equipped_items',
    'itemId', CASE WHEN TG_OP = 'DELETE' THEN OLD.item_id ELSE NEW.item_id END,
    'slot', CASE WHEN TG_OP = 'DELETE' THEN OLD.slot ELSE NEW.slot END,
    'timestamp', CURRENT_TIMESTAMP
  );
  
  -- Send notification
  PERFORM pg_notify('player_changes', payload::text);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for player_equipped_items table changes
CREATE TRIGGER player_equipped_items_changes_trigger
AFTER INSERT OR UPDATE OR DELETE ON player_equipped_items
FOR EACH ROW
EXECUTE FUNCTION notify_player_equipped_items_changes();
