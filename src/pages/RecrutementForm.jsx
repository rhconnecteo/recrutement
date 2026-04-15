import { useState, useEffect } from 'react';
import { createRequest, updateRequest, getRequest, getDropdownOptions } from '../services/api';
import { FiTrash2, FiEdit2 } from 'react-icons/fi';

export default function RecrutementForm({ requestId, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    submissionDate: new Date().toISOString().split('T')[0],
    hrbp: '',
    function: '',
    attachment: '',
    contract: '',
    requestDate: new Date().toISOString().split('T')[0],
    recruitmentCode: '',
    numberToRecruit: '',
    duration: '',
    recruitmentType: '',
    reasonForRecruitment: '',
    sourceDataJson: '',
    phasing: '',
    closureDate: '',
    comments: ''
  });

  const [sourceData, setSourceData] = useState({});
  const [newSourceFieldSource, setNewSourceFieldSource] = useState('');
  const [newSourceFieldCandidatures, setNewSourceFieldCandidatures] = useState('');
  const [newSourceFieldEntretiensPlanifies, setNewSourceFieldEntretiensPlanifies] = useState('');
  const [newSourceFieldEntretiensRealisés, setNewSourceFieldEntretiensRealisés] = useState('');
  const [editingSourceKey, setEditingSourceKey] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // Mapping fonction -> rattachement reçu directement du backend
  const [functionAttachmentMap, setFunctionAttachmentMap] = useState({});
  
  // État pour la recherche de fonction
  const [functionSearch, setFunctionSearch] = useState('');
  const [showFunctionSuggestions, setShowFunctionSuggestions] = useState(false);
  // Checkbox pour indiquer une nouvelle fonction
  const [isNewFunctionCheckbox, setIsNewFunctionCheckbox] = useState(false);

  const sources = ['Facebook', 'LinkedIn', 'Success Corner', 'Interne', 'Speed Recruiting'];

  useEffect(() => {
    loadDropdownOptions();
    if (requestId) {
      loadRequest();
    }
  }, [requestId]);

  const loadDropdownOptions = async () => {
    try {
      const result = await getDropdownOptions();
      setFunctionAttachmentMap(result.functionAttachmentMap || {});
    } catch (err) {
      console.error('Erreur lors du chargement des options:', err);
    }
  };

  const loadRequest = async () => {
    try {
      setLoading(true);
      const data = await getRequest(requestId);
      setFormData({
        ...data,
        submissionDate: typeof data.submissionDate === 'string' ? data.submissionDate.split('T')[0] : data.submissionDate,
        requestDate: typeof data.requestDate === 'string' ? data.requestDate.split('T')[0] : data.requestDate,
        closureDate: typeof data.closureDate === 'string' ? data.closureDate.split('T')[0] : data.closureDate
      });
      setFunctionSearch(data.function || '');
      
      // Reconstruire les sourceData à partir des colonnes individuelles
      const sourceDataReconstructed = {};
      if (data.facebook_candidatures || data.facebook_entretiensPlanifies || data.facebook_entretiensRealisés) {
        sourceDataReconstructed['Facebook'] = {
          candidatures: parseInt(data.facebook_candidatures) || 0,
          entretiensPlanifies: parseInt(data.facebook_entretiensPlanifies) || 0,
          entretiensRealisés: parseInt(data.facebook_entretiensRealisés) || 0
        };
      }
      if (data.linkedin_candidatures || data.linkedin_entretiensPlanifies || data.linkedin_entretiensRealisés) {
        sourceDataReconstructed['LinkedIn'] = {
          candidatures: parseInt(data.linkedin_candidatures) || 0,
          entretiensPlanifies: parseInt(data.linkedin_entretiensPlanifies) || 0,
          entretiensRealisés: parseInt(data.linkedin_entretiensRealisés) || 0
        };
      }
      if (data.successCorner_candidatures || data.successCorner_entretiensPlanifies || data.successCorner_entretiensRealisés) {
        sourceDataReconstructed['Success Corner'] = {
          candidatures: parseInt(data.successCorner_candidatures) || 0,
          entretiensPlanifies: parseInt(data.successCorner_entretiensPlanifies) || 0,
          entretiensRealisés: parseInt(data.successCorner_entretiensRealisés) || 0
        };
      }
      if (data.interne_candidatures || data.interne_entretiensPlanifies || data.interne_entretiensRealisés) {
        sourceDataReconstructed['Interne'] = {
          candidatures: parseInt(data.interne_candidatures) || 0,
          entretiensPlanifies: parseInt(data.interne_entretiensPlanifies) || 0,
          entretiensRealisés: parseInt(data.interne_entretiensRealisés) || 0
        };
      }
      if (data.speedRecruiting_candidatures || data.speedRecruiting_entretiensPlanifies || data.speedRecruiting_entretiensRealisés) {
        sourceDataReconstructed['Speed Recruiting'] = {
          candidatures: parseInt(data.speedRecruiting_candidatures) || 0,
          entretiensPlanifies: parseInt(data.speedRecruiting_entretiensPlanifies) || 0,
          entretiensRealisés: parseInt(data.speedRecruiting_entretiensRealisés) || 0
        };
      }
      setSourceData(sourceDataReconstructed);
    } catch (err) {
      setError('Erreur lors du chargement de la demande');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addSource = () => {
    if (!newSourceFieldSource || !newSourceFieldCandidatures) {
      setError('Veuillez sélectionner une source et entrer le nombre de candidatures');
      return;
    }

    const key = newSourceFieldSource;
    const newDataForSource = {
      candidatures: parseInt(newSourceFieldCandidatures) || 0,
      entretiensPlanifies: parseInt(newSourceFieldEntretiensPlanifies) || 0,
      entretiensRealisés: parseInt(newSourceFieldEntretiensRealisés) || 0
    };

    setSourceData(prev => ({
      ...prev,
      [key]: newDataForSource
    }));

    // Réinitialiser les champs et quitter mode édition
    setNewSourceFieldSource('');
    setNewSourceFieldCandidatures('');
    setNewSourceFieldEntretiensPlanifies('');
    setNewSourceFieldEntretiensRealisés('');
    setEditingSourceKey(null);
    setError('');
  };

  const editSource = (sourceKey) => {
    const sourceInfo = sourceData[sourceKey];
    setNewSourceFieldSource(sourceKey);
    setNewSourceFieldCandidatures(sourceInfo.candidatures.toString());
    setNewSourceFieldEntretiensPlanifies(sourceInfo.entretiensPlanifies.toString());
    setNewSourceFieldEntretiensRealisés(sourceInfo.entretiensRealisés.toString());
    setEditingSourceKey(sourceKey);
  };

  const cancelEdit = () => {
    setNewSourceFieldSource('');
    setNewSourceFieldCandidatures('');
    setNewSourceFieldEntretiensPlanifies('');
    setNewSourceFieldEntretiensRealisés('');
    setEditingSourceKey(null);
    setError('');
  };

  const removeSource = (sourceKey) => {
    setSourceData(prev => {
      const updated = { ...prev };
      delete updated[sourceKey];
      return updated;
    });
    // Si on était en train d'éditer cette source, annuler l'édition
    if (editingSourceKey === sourceKey) {
      cancelEdit();
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Effacer le 0 automatiquement au focus sur les champs numériques
  const handleNumberFocus = (e) => {
    if (e.target.value === '0' || e.target.value === '') {
      e.target.value = '';
      e.target.select();
    }
  };

  // Gérer la recherche de fonction
  const handleFunctionSearch = (value) => {
    setFunctionSearch(value);
    setShowFunctionSuggestions(true);
  };

  // Sélectionner une fonction
  const selectFunction = (fn) => {
    setFormData(prev => ({
      ...prev,
      function: fn,
      attachment: functionAttachmentMap[fn] || ''
    }));
    setFunctionSearch(fn);
    setShowFunctionSuggestions(false);
    setIsNewFunctionCheckbox(false);
  };

  // Filtrer les suggestions de fonction depuis les clés du mapping
  const filteredFunctions = Object.keys(functionAttachmentMap).filter(fn =>
    fn.toLowerCase().includes(functionSearch.toLowerCase())
  );

  /**
   * Calculer la deadline (Date de la demande + Durée en jours)
   */
  const calculateDeadline = () => {
    if (!formData.requestDate || !formData.duration) return '';
    
    try {
      const days = parseInt(formData.duration);
      if (isNaN(days)) return '';
      
      const date = new Date(formData.requestDate);
      date.setDate(date.getDate() + days);
      
      return date.toISOString().split('T')[0];
    } catch (err) {
      console.error('Erreur calcul deadline:', err);
      return '';
    }
  };

  /**
   * Convertir sourceData en colonnes individuelles pour l'API
   */
  const convertSourceDataToColumns = () => {
    const columns = {
      facebook_candidatures: '',
      facebook_entretiensPlanifies: '',
      facebook_entretiensRealisés: '',
      linkedin_candidatures: '',
      linkedin_entretiensPlanifies: '',
      linkedin_entretiensRealisés: '',
      successCorner_candidatures: '',
      successCorner_entretiensPlanifies: '',
      successCorner_entretiensRealisés: '',
      interne_candidatures: '',
      interne_entretiensPlanifies: '',
      interne_entretiensRealisés: '',
      speedRecruiting_candidatures: '',
      speedRecruiting_entretiensPlanifies: '',
      speedRecruiting_entretiensRealisés: ''
    };

    Object.entries(sourceData).forEach(([key, data]) => {
      const normalizedKey = key.toLowerCase().replace(/\s+/g, '');
      
      if (normalizedKey === 'facebook') {
        columns.facebook_candidatures = data.candidatures;
        columns.facebook_entretiensPlanifies = data.entretiensPlanifies;
        columns.facebook_entretiensRealisés = data.entretiensRealisés;
      } else if (normalizedKey === 'linkedin') {
        columns.linkedin_candidatures = data.candidatures;
        columns.linkedin_entretiensPlanifies = data.entretiensPlanifies;
        columns.linkedin_entretiensRealisés = data.entretiensRealisés;
      } else if (normalizedKey === 'successcorner') {
        columns.successCorner_candidatures = data.candidatures;
        columns.successCorner_entretiensPlanifies = data.entretiensPlanifies;
        columns.successCorner_entretiensRealisés = data.entretiensRealisés;
      } else if (normalizedKey === 'interne') {
        columns.interne_candidatures = data.candidatures;
        columns.interne_entretiensPlanifies = data.entretiensPlanifies;
        columns.interne_entretiensRealisés = data.entretiensRealisés;
      } else if (normalizedKey === 'speedrecruiting') {
        columns.speedRecruiting_candidatures = data.candidatures;
        columns.speedRecruiting_entretiensPlanifies = data.entretiensPlanifies;
        columns.speedRecruiting_entretiensRealisés = data.entretiensRealisés;
      }
    });

    return columns;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      
      // Convertir sourceData en colonnes individuelles
      const sourceColumns = convertSourceDataToColumns();
      
      // Utiliser la fonction depuis la recherche
      const dataToSubmit = {
        ...formData,
        function: functionSearch,
        ...sourceColumns
      };
      
      if (requestId) {
        await updateRequest(requestId, dataToSubmit);
      } else {
        await createRequest(dataToSubmit);
      }
      
      onSave();
    } catch (err) {
      setError('Erreur lors de la sauvegarde');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2>{requestId ? 'Modifier la Demande' : 'Nouvelle Demande'}</h2>
      {error && <p className="error-message">{error}</p>}

      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>Code de recrutement:</label>
            <input
              type="text"
              name="recruitmentCode"
              value={formData.recruitmentCode}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Date de la demande:</label>
            <input
              type="date"
              name="requestDate"
              value={formData.requestDate}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>HRBP:</label>
            <select
              name="hrbp"
              value={formData.hrbp}
              onChange={handleChange}
            >
              <option value="">Sélectionner...</option>
              <option value="Lanto">Lanto</option>
              <option value="Mamonjisoa">Mamonjisoa</option>
              <option value="Malala">Malala</option>
              <option value="Christiana">Christiana</option>
              <option value="Koloina">Koloina</option>
              <option value="Carine">Carine</option>
              <option value="Ravo">Ravo</option>
              <option value="Valerie">Valerie</option>
            </select>
          </div>
          <div className="form-group">
            <label>Contrat:</label>
            <select
              name="contract"
              value={formData.contract}
              onChange={handleChange}
            >
              <option value="">Sélectionner...</option>
              <option value="CDI">CDI</option>
              <option value="CDD">CDD</option>
              <option value="STAGIAIRE">STAGIAIRE</option>
              <option value="INT MDJ">INT MDJ</option>
              <option value="APPRENTI">APPRENTI</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Fonction:</label>
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={isNewFunctionCheckbox}
                  onChange={(e) => {
                    setIsNewFunctionCheckbox(e.target.checked);
                    if (!e.target.checked) {
                      setFunctionSearch('');
                      setFormData(prev => ({...prev, function: '', attachment: ''}));
                    }
                  }}
                />
                Nouvelle fonction
              </label>
            </div>
            {!isNewFunctionCheckbox ? (
              <div className="search-container">
                <input
                  type="text"
                  placeholder="Rechercher une fonction..."
                  value={functionSearch}
                  onChange={(e) => handleFunctionSearch(e.target.value)}
                  onFocus={() => setShowFunctionSuggestions(true)}
                  className="search-input"
                  required={!isNewFunctionCheckbox}
                />
                {showFunctionSuggestions && functionSearch && (
                  <div className="suggestions-dropdown">
                    {filteredFunctions.length > 0 ? (
                      filteredFunctions.map(fn => (
                        <div
                          key={fn}
                          className="suggestion-item"
                          onClick={() => selectFunction(fn)}
                        >
                          {fn}
                        </div>
                      ))
                    ) : (
                      <div className="suggestion-item disabled">
                        Aucune correspondance
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <input
                type="text"
                placeholder="Saisir la nouvelle fonction..."
                value={functionSearch}
                onChange={(e) => {
                  setFunctionSearch(e.target.value);
                  setFormData(prev => ({...prev, function: e.target.value}));
                }}
                required
              />
            )}
          </div>
          <div className="form-group">
            <label>Rattachement:</label>
            {isNewFunctionCheckbox ? (
              <input
                type="text"
                value={formData.attachment}
                onChange={(e) => setFormData(prev => ({...prev, attachment: e.target.value}))}
                placeholder="Saisir le rattachement..."
                required
              />
            ) : (
              <input
                type="text"
                value={formData.attachment}
                readOnly
                className="readonly-input"
                placeholder="Sélectionnez une fonction..."
              />
            )}
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Type de recrutement:</label>
            <select
              name="recruitmentType"
              value={formData.recruitmentType}
              onChange={handleChange}
            >
              <option value="">Sélectionner...</option>
              <option value="Nouveau poste">Nouveau poste</option>
              <option value="Remplacement">Remplacement</option>
              <option value="Rajout">Rajout</option>
            </select>
          </div>
          <div className="form-group">
            <label>Raison de recrutement:</label>
            <select
              name="reasonForRecruitment"
              value={formData.reasonForRecruitment}
              onChange={handleChange}
            >
              <option value="">Sélectionner...</option>
              <option value="Suite de démission/Abadon de poste/licenciement">Suite de démission/Abadon de poste/licenciement</option>
              <option value="Nouvelle organisation">Nouvelle organisation</option>
              <option value="Suite fin de contrat">Suite fin de contrat</option>
              <option value="Suite promotion/Nomination au poste/Mutation">Suite promotion/Nomination au poste/Mutation</option>
              <option value="Suite congé de maternité">Suite congé de maternité</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Nombre à recruter:</label>
            <input
              type="number"
              name="numberToRecruit"
              value={formData.numberToRecruit}
              onChange={handleChange}
              onFocus={handleNumberFocus}
              min="1"
              placeholder="0"
            />
          </div>
          <div className="form-group">
            <label>Durée (en jours):</label>
            <input
              type="number"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              onFocus={handleNumberFocus}
              placeholder="Ex: 30"
              min="0"
            />
          </div>
          <div className="form-group">
            <label>Deadline:</label>
            <input
              type="date"
              value={calculateDeadline()}
              readOnly
              className="readonly-input"
              placeholder="Date de demande + Durée"
            />
          </div>
        </div>

        {/* Sources de collecte */}
        <div className="sources-section">
          <h3>Sources de Collecte de Données</h3>
          
          {/* Formulaire d'ajout de source */}
          <div className="add-source-form">
            <div className="form-row">
              <div className="form-group">
                <label>Sélectionner une source:</label>
                <select
                  value={newSourceFieldSource}
                  onChange={(e) => setNewSourceFieldSource(e.target.value)}
                  disabled={editingSourceKey !== null}
                >
                  <option value="">Choisir une source...</option>
                  {sources.map(s => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Candidatures reçues:</label>
                <input
                  type="number"
                  value={newSourceFieldCandidatures}
                  onChange={(e) => setNewSourceFieldCandidatures(e.target.value)}
                  onFocus={handleNumberFocus}
                  min="0"
                  placeholder="0"
                />
              </div>
              <div className="form-group">
                <label>Entretiens à planifier:</label>
                <input
                  type="number"
                  value={newSourceFieldEntretiensPlanifies}
                  onChange={(e) => setNewSourceFieldEntretiensPlanifies(e.target.value)}
                  onFocus={handleNumberFocus}
                  min="0"
                  placeholder="0"
                />
              </div>
              <div className="form-group">
                <label>Entretiens réalisés:</label>
                <input
                  type="number"
                  value={newSourceFieldEntretiensRealisés}
                  onChange={(e) => setNewSourceFieldEntretiensRealisés(e.target.value)}
                  onFocus={handleNumberFocus}
                  min="0"
                  placeholder="0"
                />
              </div>
              <div className="form-group">
                <button type="button" onClick={addSource} className="btn-add-source">
                  {editingSourceKey ? '✓ Mettre à jour Source' : '+ Ajouter Source'}
                </button>
                {editingSourceKey && (
                  <button type="button" onClick={cancelEdit} className="btn-cancel-edit">
                    Annuler
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Liste des sources ajoutées */}
          {Object.keys(sourceData).length > 0 && (
            <div className="sources-list">
              <h4>Sources ajoutées:</h4>
              <table className="sources-table">
                <thead>
                  <tr>
                    <th>Source</th>
                    <th>Candidatures</th>
                    <th>Entretiens Planifiés</th>
                    <th>Entretiens Réalisés</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(sourceData).map(([key, data]) => (
                    <tr key={key}>
                      <td><strong>{key}</strong></td>
                      <td>{data.candidatures}</td>
                      <td>{data.entretiensPlanifies}</td>
                      <td>{data.entretiensRealisés}</td>
                      <td>
                        <button
                          type="button"
                          onClick={() => editSource(key)}
                          className="btn-edit-source"
                          title="Modifier cette source"
                        >
                          <FiEdit2 size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeSource(key)}
                          className="btn-delete-source"
                          title="Supprimer cette source"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Phasing:</label>
            <select
              name="phasing"
              value={formData.phasing}
              onChange={handleChange}
            >
              <option value="">Sélectionner...</option>
              <option value="Embauche">Embauche</option>
              <option value="Test">Test</option>
              <option value="Préselection">Préselection</option>
              <option value="Entretien">Entretien</option>
            </select>
          </div>
          <div className="form-group">
            <label>Date de clôture:</label>
            <input
              type="date"
              name="closureDate"
              value={formData.closureDate}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Commentaires:</label>
          <textarea
            name="comments"
            value={formData.comments}
            onChange={handleChange}
            rows="4"
          />
        </div>

        <div className="form-actions">
          <button type="submit" disabled={loading} className="btn-save">
            {loading ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
          <button type="button" onClick={onCancel} className="btn-cancel">
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}
