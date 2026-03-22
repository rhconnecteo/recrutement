import { useState, useEffect } from 'react';
import { createRequest, updateRequest, getRequest, getDropdownOptions } from '../services/api';

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
    receivedApplications: '',
    interviewsToSchedule: '',
    interviewsConducted: '',
    phasing: '',
    closureDate: '',
    comments: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // Mapping fonction -> rattachement reçu directement du backend
  const [functionAttachmentMap, setFunctionAttachmentMap] = useState({});
  
  // État pour la recherche de fonction
  const [functionSearch, setFunctionSearch] = useState('');
  const [showFunctionSuggestions, setShowFunctionSuggestions] = useState(false);
  // Checkbox pour indiquer une nouvelle fonction
  const [isNewFunctionCheckbox, setIsNewFunctionCheckbox] = useState(false);

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
    } catch (err) {
      setError('Erreur lors du chargement de la demande');
      console.error(err);
    } finally {
      setLoading(false);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      
      // Utiliser la fonction depuis la recherche
      const dataToSubmit = {
        ...formData,
        function: functionSearch
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

        <div className="form-row three-columns">
          <div className="form-group">
            <label>Candidatures reçues:</label>
            <input
              type="number"
              name="receivedApplications"
              value={formData.receivedApplications}
              onChange={handleChange}
              onFocus={handleNumberFocus}
              min="0"
              placeholder="0"
            />
          </div>
          <div className="form-group">
            <label>Entretiens à planifier:</label>
            <input
              type="number"
              name="interviewsToSchedule"
              value={formData.interviewsToSchedule}
              onChange={handleChange}
              onFocus={handleNumberFocus}
              min="0"
              placeholder="0"
            />
          </div>
          <div className="form-group">
            <label>Entretiens réalisés:</label>
            <input
              type="number"
              name="interviewsConducted"
              value={formData.interviewsConducted}
              onChange={handleChange}
              onFocus={handleNumberFocus}
              min="0"
              placeholder="0"
            />
          </div>
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
