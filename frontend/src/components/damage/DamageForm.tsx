import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Save } from 'lucide-react';
import { DAMAGE_ZONE_LABELS, type DamageZone } from '../../types/damage';
import { MAX_DESCRIPTION_LENGTH, validatePhoto } from '../../utils/damageValidation';
import styles from './DamageForm.module.css';

interface DamageFormProps {
  zone: DamageZone | null;
  /** Debe lanzar un Error con mensaje legible si falla. */
  onSubmit: (description: string, photo: File | null) => Promise<void>;
}

export function DamageForm({ zone, onSubmit }: DamageFormProps) {
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  // Cambiar esta clave vacía el campo de archivo después de guardar.
  const [fileInputKey, setFileInputKey] = useState(0);
  const [error, setError] = useState('');

  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    if (file) {
      const photoError = validatePhoto(file);
      if (photoError) {
        setError(photoError);
        setPhoto(null);
        event.target.value = '';
        return;
      }
    }
    setError('');
    setPhoto(file);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!zone) {
      setError('Primero selecciona una zona en el diagrama.');
      return;
    }

    try {
      await onSubmit(description, photo);
      setDescription('');
      setPhoto(null);
      setFileInputKey((key) => key + 1);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el daño.');
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <p className={styles.zone}>
        Zona seleccionada: <strong>{zone ? DAMAGE_ZONE_LABELS[zone] : 'ninguna'}</strong>
      </p>

      <div className={styles.field}>
        <label htmlFor="damage-description">Descripción del daño</label>
        <textarea
          id="damage-description"
          rows={3}
          maxLength={MAX_DESCRIPTION_LENGTH}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="damage-photo">Foto (opcional, JPG/PNG/WebP, máx. 5 MB)</label>
        <input
          key={fileInputKey}
          id="damage-photo"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handlePhotoChange}
        />
      </div>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      <button type="submit" className={styles.submit}>
        <Save size={16} aria-hidden="true" />
        Guardar daño
      </button>
    </form>
  );
}
