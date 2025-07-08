import {ChangeEvent, useEffect, useState} from "react";
import {api, Rag} from "@/api/api";
import {useUserStore} from "@/store/user_store";
import styles from './settings.module.scss'
import {useRagStore} from "@/store/fileStore";

export const RagSettings = () => {
  const {userId} = useUserStore()

  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const {rag, setRag} = useRagStore()

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setFile(selectedFile || null);
    setMessage('');
  };

  useEffect(() => {
    if (userId) {
      api.getRagFileByUserId(userId).then(({data}) => {
        setRag(data)
      })
    }
  }, [userId])

  const onDelete = () => {
    if(rag){
      api.deleteRagFile(rag.id).then(() => {
        setRag(null)
      })
    }
  }

  const onUploadFile = () => {
    if(userId && file){

      if (!file.name.endsWith('.txt')) {
        return;
      }

      const formData = new FormData();
      formData.append('file', file);

      setIsUploading(true);
      setMessage('');

      api.uploadRagFile(userId, formData).then(({data}) => {
        setRag(data)
      }).catch(error => {
        const errMsg =
          error.response?.data?.detail || error.message || 'Неизвестная ошибка';
        setMessage(`Ошибка загрузки: ${errMsg}`);
      }).finally(()=>{
        setIsUploading(false);
      })
    }
  }

  return <label className={styles.label}>
      <span>Файл контекста</span>
      <div className={styles.ragInputWrapper}>
        {rag
          ? <div className={styles.existRag}>
            <div className={styles.ragName}>{rag.file_name}</div>
            <button className={styles.deleteBtn} onClick={onDelete}>
              Удалить
            </button>
          </div>
          : <div className={styles.uploadRag}>
            <input type="file" accept=".txt" onChange={handleFileChange} />
            <button onClick={onUploadFile} disabled={isUploading} className={styles.uploadButton}>
              {isUploading ? 'Загрузка...' : 'Загрузить'}
            </button>
          </div>
        }
      </div>
      {message && <p>{message}</p>}
  </label>
}
