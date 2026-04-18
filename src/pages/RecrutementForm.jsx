import { useState, useEffect, useMemo, useCallback } from 'react';
import { createRequest, updateRequest, getRequest, getDropdownOptions } from '../services/api';
import { FiTrash2, FiEdit2 } from 'react-icons/fi';
import { FaFacebook, FaLinkedin, FaBuilding, FaUsers } from 'react-icons/fa';

export default function RecrutementForm({ requestId, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    submissionDate: new Date().toISOString().split('T')[0],
    hrbp: '',
    function: '',
    attachment: '',
    cdo: '',
    contract: '',
    pole: '',
    requestDate: new Date().toISOString().split('T')[0],
    recruitmentCode: '',
    numberToRecruit: '',
    duration: '',
    recruitmentType: '',
    reasonForRecruitment: '',
    totalCandidatures: 0,
    phasing: '',
    closureDate: '',
    comments: ''
  });

  const [sourceData, setSourceData] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isNewFunctionCheckbox, setIsNewFunctionCheckbox] = useState(false);
  const [functionSearch, setFunctionSearch] = useState('');
  const [showFunctionSuggestions, setShowFunctionSuggestions] = useState(false);
  const [filteredFunctions, setFilteredFunctions] = useState([]);
  const [dropdownOptions, setDropdownOptions] = useState([]);
  const [functionAttachmentMap, setFunctionAttachmentMap] = useState({});
  const [newSourceFieldSource, setNewSourceFieldSource] = useState('');
  const [newSourceFieldCandidatures, setNewSourceFieldCandidatures] = useState('');
  const [newSourceFieldEntretiensPlanifies, setNewSourceFieldEntretiensPlanifies] = useState('');
  const [newSourceFieldEntretiensRealisés, setNewSourceFieldEntretiensRealisés] = useState('');
  const [editingSourceKey, setEditingSourceKey] = useState(null);

  const sources = ['Facebook', 'LinkedIn', 'Success Corner', 'Interne', 'Speed Recruiting'];
  const recruitmentReasons = [
    'Suite de démission/Abadon de poste/licenciement',
    'Nouvelle organisation',
    'Suite fin de contrat',
    'Suite promotion/Nomination au poste/Mutation',
    'Suite congé de maternité',
    'Autre'
  ];
  const recruitmentTypes = ['Nouveau poste', 'Remplacement', 'Rajout'];

  useEffect(() => {
    loadDropdownOptions();
    if (requestId) {
      loadRequest(requestId);
    }
  }, [requestId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.search-container')) {
        setShowFunctionSuggestions(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const loadDropdownOptions = async () => {
    try {
      const response = await getDropdownOptions();
      
      let combinedOptions = [];
      
      // Chercher d'abord le nouveau format (array) - peut être en response.data.functionAttachmentList
      const functionList = response.data?.functionAttachmentList || response.functionAttachmentList;
      
      if (functionList && Array.isArray(functionList)) {
        combinedOptions = functionList.map(item => ({
          function: item.function,
          attachment: item.attachment,
          cdo: item.cdo || '',
          label: `${item.function}${item.attachment ? ' - ' + item.attachment : ''}${item.cdo ? ' - ' + item.cdo : ''}`,
          key: `${item.function}|${item.attachment}|${item.cdo}`
        }));
      } 
      // Sinon utiliser l'ancien format (objet)
      else {
        const mapData = response.data?.functionAttachmentMap || response.functionAttachmentMap;
        Object.entries(mapData || {}).forEach(([fn, attachment]) => {
          combinedOptions.push({
            function: fn,
            attachment: attachment,
            cdo: '',
            label: attachment ? `${fn} - ${attachment}` : fn,
            key: `${fn}|${attachment}`
          });
        });
      }
      
      console.log('Options chargées:', combinedOptions);
      setFunctionAttachmentMap(combinedOptions);
      setDropdownOptions(combinedOptions);
    } catch (err) {
      console.error('Erreur chargement options:', err);
    }
  };

  const formatDateForInput = (dateValue) => {
    if (!dateValue) return '';
    
    // Si c'est un format ISO avec heure (2026-04-14T22:00:00.000Z)
    if (typeof dateValue === 'string' && dateValue.includes('T')) {
      return dateValue.split('T')[0];
    }
    
    // Si c'est déjà un format yyyy-MM-dd
    if (typeof dateValue === 'string' && dateValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return dateValue;
    }
    
    // Si c'est un objet Date
    if (dateValue instanceof Date) {
      return dateValue.toISOString().split('T')[0];
    }
    
    return dateValue;
  };

  const loadRequest = async (id) => {
    try {
      setLoading(true);
      const response = await getRequest(id);
      if (response.success && response.data) {
        const data = response.data;
        setFormData({
          submissionDate: formatDateForInput(data.submissionDate),
          hrbp: data.hrbp || '',
          function: data.function || '',
          attachment: data.attachment || '',
          cdo: data.cdo || '',
          contract: data.contract || '',
          pole: data.pole || '',
          requestDate: formatDateForInput(data.requestDate),
          recruitmentCode: data.recruitmentCode || '',
          numberToRecruit: data.numberToRecruit || '',
          duration: data.duration || '',
          recruitmentType: data.recruitmentType || '',
          reasonForRecruitment: data.reasonForRecruitment || '',
          totalCandidatures: data.totalCandidatures || 0,
          phasing: data.phasing || '',
          closureDate: formatDateForInput(data.closureDate),
          comments: data.comments || ''
        });
        if (data.sourceData) {
          // Filtrer les sources avec au moins 1 valeur non-zéro
          const filteredSourceData = {};
          Object.entries(data.sourceData).forEach(([source, values]) => {
            const hasData = values.candidatures || values.entretiensPlanifiés || values.entretiensRéalisés;
            if (hasData) {
              filteredSourceData[source] = values;
            }
          });
          setSourceData(filteredSourceData);
        }
      }
    } catch (err) {
      setError('Erreur lors du chargement de la demande');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const calculateDurationByPole = (pole, numberToRecruit) => {
    const numRecruit = parseInt(numberToRecruit) || 0;
    switch (pole) {
      case 'INSHORE':
        // 1 jour par personne à recruter
        return numRecruit.toString();
      case 'OFFSHORE':
        // Moins de 30 personnes: 15 jours, sinon 30 jours
        return numRecruit < 30 ? '15' : '30';
      case 'MANAGERS':
        return '30';
      case 'TOP MANAGERS':
        return '90';
      case 'Support':
        return '45';
      default:
        return '';
    }
  };

  const calculateDeadline = () => {
    if (!formData.requestDate || !formData.duration) return '';
    const date = new Date(formData.requestDate);
    let daysToAdd = parseInt(formData.duration);
    
    while (daysToAdd > 0) {
      date.setDate(date.getDate() + 1);
      const dayOfWeek = date.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        daysToAdd--;
      }
    }
    
    return date.toISOString().split('T')[0];
  };

  const calculateTotalCandidatures = () => {
    return Object.values(sourceData).reduce((sum, source) => sum + (source.candidatures || 0), 0);
  };

  const generateRecruitmentCode = (pole, requestDate, functionName) => {
    if (!pole || !requestDate || !functionName) return '';

    // Extract day, month and year
    const date = new Date(requestDate);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);

    // Get pole prefix
    let polePrefix = '';
    switch (pole) {
      case 'OFFSHORE':
        polePrefix = 'OFF';
        break;
      case 'INSHORE':
        polePrefix = 'IN';
        break;
      case 'Support':
        polePrefix = 'SUP';
        break;
      case 'TOP MANAGERS':
        polePrefix = 'TOPMAN';
        break;
      case 'MANAGERS':
        polePrefix = 'MAN';
        break;
      default:
        return '';
    }

    // Extract first letters from first 4 words of function
    const words = functionName.trim().split(/\s+/).slice(0, 4);
    const functionCode = words.map(word => word.charAt(0).toUpperCase()).join('');

    return `${polePrefix}${day}${month}${year}${functionCode}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({...prev, [name]: value}));
    
    if (name === 'pole' || name === 'numberToRecruit') {
      const poleValue = name === 'pole' ? value : formData.pole;
      const numberValue = name === 'numberToRecruit' ? value : formData.numberToRecruit;
      if (poleValue && numberValue) {
        const newDuration = calculateDurationByPole(poleValue, numberValue);
        setFormData(prev => ({...prev, duration: newDuration}));
      }
    }

    // Auto-generate recruitment code when pole, date, or function changes
    if (name === 'pole' || name === 'requestDate' || name === 'function') {
      const poleValue = name === 'pole' ? value : formData.pole;
      const dateValue = name === 'requestDate' ? value : formData.requestDate;
      const functionValue = name === 'function' ? value : formData.function;
      
      if (poleValue && dateValue && functionValue) {
        const generatedCode = generateRecruitmentCode(poleValue, dateValue, functionValue);
        setFormData(prev => ({...prev, recruitmentCode: generatedCode}));
      }
    }
  };

  const handleFunctionSearch = useCallback((value) => {
    setFunctionSearch(value);
    if (value) {
      const filtered = dropdownOptions.filter(option => 
        option.label.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredFunctions(filtered);
    } else {
      setFilteredFunctions([]);
    }
  }, [dropdownOptions]);

  const selectFunction = useCallback((option) => {
    setFormData(prev => {
      const updatedData = {
        ...prev,
        function: option.function,
        attachment: option.attachment,
        cdo: option.cdo
      };
      
      // Auto-generate recruitment code when function is selected
      if (updatedData.pole && updatedData.requestDate && option.function) {
        const generatedCode = generateRecruitmentCode(updatedData.pole, updatedData.requestDate, option.function);
        updatedData.recruitmentCode = generatedCode;
      }
      
      return updatedData;
    });
    setFunctionSearch('');
    setShowFunctionSuggestions(false);
  }, [formData.pole, formData.requestDate]);

  const handleNumberFocus = (e) => {
    if (e.target.value === '0') {
      e.target.value = '';
    }
  };

  const addSource = () => {
    if (!newSourceFieldSource) {
      alert('Veuillez sélectionner une source');
      return;
    }
    
    const sourceToAdd = {
      candidatures: parseInt(newSourceFieldCandidatures) || 0,
      entretiensPlanifiés: parseInt(newSourceFieldEntretiensPlanifies) || 0,
      entretiensRéalisés: parseInt(newSourceFieldEntretiensRealisés) || 0
    };
    
    if (editingSourceKey) {
      setSourceData(prev => ({
        ...prev,
        [editingSourceKey]: sourceToAdd
      }));
      setEditingSourceKey(null);
    } else {
      setSourceData(prev => ({
        ...prev,
        [newSourceFieldSource]: sourceToAdd
      }));
    }

    setNewSourceFieldSource('');
    setNewSourceFieldCandidatures('');
    setNewSourceFieldEntretiensPlanifies('');
    setNewSourceFieldEntretiensRealisés('');
  };

  const editSource = (key) => {
    const source = sourceData[key];
    setNewSourceFieldSource(key);
    setNewSourceFieldCandidatures(source.candidatures.toString());
    setNewSourceFieldEntretiensPlanifies(source.entretiensPlanifiés.toString());
    setNewSourceFieldEntretiensRealisés(source.entretiensRéalisés.toString());
    setEditingSourceKey(key);
  };

  const removeSource = (key) => {
    setSourceData(prev => {
      const newData = {...prev};
      delete newData[key];
      return newData;
    });
  };

  const cancelEdit = () => {
    setEditingSourceKey(null);
    setNewSourceFieldSource('');
    setNewSourceFieldCandidatures('');
    setNewSourceFieldEntretiensPlanifies('');
    setNewSourceFieldEntretiensRealisés('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.recruitmentCode || !formData.function) {
      setError('Veuillez remplir les champs obligatoires');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const totalCands = calculateTotalCandidatures();
      const requestData = {
        ...formData,
        totalCandidatures: totalCands,
        facebook_candidatures: sourceData['Facebook']?.candidatures || 0,
        facebook_entretiensPlanifiés: sourceData['Facebook']?.entretiensPlanifiés || 0,
        facebook_entretiensRéalisés: sourceData['Facebook']?.entretiensRéalisés || 0,
        linkedin_candidatures: sourceData['LinkedIn']?.candidatures || 0,
        linkedin_entretiensPlanifiés: sourceData['LinkedIn']?.entretiensPlanifiés || 0,
        linkedin_entretiensRéalisés: sourceData['LinkedIn']?.entretiensRéalisés || 0,
        successCorner_candidatures: sourceData['Success Corner']?.candidatures || 0,
        successCorner_entretiensPlanifiés: sourceData['Success Corner']?.entretiensPlanifiés || 0,
        successCorner_entretiensRéalisés: sourceData['Success Corner']?.entretiensRéalisés || 0,
        interne_candidatures: sourceData['Interne']?.candidatures || 0,
        interne_entretiensPlanifiés: sourceData['Interne']?.entretiensPlanifiés || 0,
        interne_entretiensRéalisés: sourceData['Interne']?.entretiensRéalisés || 0,
        speedRecruiting_candidatures: sourceData['Speed Recruiting']?.candidatures || 0,
        speedRecruiting_entretiensPlanifiés: sourceData['Speed Recruiting']?.entretiensPlanifiés || 0,
        speedRecruiting_entretiensRéalisés: sourceData['Speed Recruiting']?.entretiensRéalisés || 0
      };

      let response;
      if (requestId) {
        response = await updateRequest(requestId, requestData);
      } else {
        response = await createRequest(requestData);
      }

      if (response.success) {
        onSave();
      } else {
        setError(response.error || 'Une erreur est survenue');
      }
    } catch (err) {
      setError('Erreur lors de la sauvegarde');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2>{requestId ? '✏️ Modifier la Demande' : '➕ Nouvelle Demande'}</h2>
      {error && <p className="error-message">{error}</p>}

      <form onSubmit={handleSubmit}>
        {/* === SECTION 1: INFOS GÉNÉRALES === */}
        <div className="form-section">
          <h3>📋 Informations Générales</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Date de soumission:</label>
              <input
                type="date"
                name="submissionDate"
                value={formData.submissionDate}
                onChange={handleChange}
              />
            </div>
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
        </div>

        {/* === SECTION 2: FONCTION & RATTACHEMENT === */}
        <div className="form-section">
          <h3>🎯 Fonction et Rattachement</h3>
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
                      setFormData(prev => ({...prev, function: ''}));
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
                  onChange={(e) => {
                    handleFunctionSearch(e.target.value);
                  }}
                  onFocus={() => setShowFunctionSuggestions(true)}
                  className="search-input"
                />
                {formData.function && (
                  <div className="selected-function">
                    {formData.function}
                  </div>
                )}
                {showFunctionSuggestions && functionSearch && (
                  <div className="suggestions-dropdown">
                    {filteredFunctions.length > 0 ? (
                      filteredFunctions.map((option, idx) => (
                        <div
                          key={idx}
                          className="suggestion-item"
                          onClick={() => selectFunction(option)}
                        >
                          {option.function} {option.attachment && `(${option.attachment})`}
                        </div>
                      ))
                    ) : (
                      <div className="suggestion-item disabled">Aucune fonction trouvée</div>
                    )}
                  </div>
                )}
                {showFunctionSuggestions && !functionSearch && dropdownOptions.length > 0 && (
                  <div className="suggestions-dropdown">
                    {dropdownOptions.map((option, idx) => (
                      <div
                        key={idx}
                        className="suggestion-item"
                        onClick={() => selectFunction(option)}
                      >
                        {option.function} {option.attachment && `(${option.attachment})`}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <input
                type="text"
                placeholder="Entrer la nouvelle fonction..."
                value={formData.function}
                onChange={(e) => setFormData(prev => ({...prev, function: e.target.value}))}
              />
            )}
          </div>
          <div className="form-group">
            <label>Rattachement:</label>
            <input
              type="text"
              name="attachment"
              value={formData.attachment}
              onChange={handleChange}
              readOnly={formData.function && !isNewFunctionCheckbox}
              className={formData.function && !isNewFunctionCheckbox ? 'readonly-input' : ''}
            />
          </div>
          <div className="form-group">
            <label>CDO:</label>
            <input
              type="text"
              name="cdo"
              value={formData.cdo}
              onChange={handleChange}
              readOnly={formData.function && !isNewFunctionCheckbox}
              className={formData.function && !isNewFunctionCheckbox ? 'readonly-input' : ''}
            />
          </div>
        </div>

        {/* === SECTION 3: RECRUTEMENT === */}
        <div className="form-section">
          <h3>👥 Détails du Recrutement</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Code de recrutement:</label>
              <input
                type="text"
                name="recruitmentCode"
                value={formData.recruitmentCode}
                readOnly
                className="readonly-input"
                required
              />
            </div>
            <div className="form-group">
              <label>Pôle:</label>
              <select
                name="pole"
                value={formData.pole}
                onChange={handleChange}
              >
                <option value="">Sélectionner...</option>
                <option value="OFFSHORE">OFFSHORE</option>
                <option value="INSHORE">INSHORE</option>
                <option value="MANAGERS">MANAGERS</option>
                <option value="TOP MANAGERS">TOP MANAGERS</option>
                <option value="Support">Support</option>
              </select>
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
                {recruitmentTypes.map((type, idx) => (
                  <option key={idx} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Raison du recrutement:</label>
              <select
                name="reasonForRecruitment"
                value={formData.reasonForRecruitment}
                onChange={handleChange}
              >
                <option value="">Sélectionner...</option>
                {recruitmentReasons.map((reason, idx) => (
                  <option key={idx} value={reason}>{reason}</option>
                ))}
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
                min="1"
                required
              />
            </div>
            <div className="form-group">
              <label>Durée (jours):</label>
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                min="1"
              />
            </div>
          </div>
        </div>

        {/* === SECTION 4: DATES === */}
        <div className="form-section">
          <h3>📅 Calendrier</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Date de demande:</label>
              <input
                type="date"
                name="requestDate"
                value={formData.requestDate}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Date de deadline (calculée):</label>
              <input
                type="date"
                value={calculateDeadline()}
                readOnly
                className="readonly-input"
              />
            </div>
          </div>
        </div>

        {/* === SECTION 5: SOURCES DE COLLECTE === */}
        <div className="form-section">
          <h3>📱 Sources de Collecte de Données</h3>
          
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
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Candidatures:</label>
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
                  {editingSourceKey ? '✓ Mettre à jour' : '+ Ajouter'}
                </button>
                {editingSourceKey && (
                  <button type="button" onClick={cancelEdit} className="btn-cancel-edit">
                    Annuler
                  </button>
                )}
              </div>
            </div>
          </div>

          {Object.keys(sourceData).length > 0 && (
            <div className="sources-list">
              <h4>Sources ajoutées:</h4>
              <table className="sources-table">
                <thead>
                  <tr>
                    <th>Source</th>
                    <th>Candidatures</th>
                    <th>Planifiés</th>
                    <th>Réalisés</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(sourceData).map(([key, data]) => {
                    const getSourceIcon = (source) => {
                      switch(source) {
                        case 'Facebook':
                          return <FaFacebook size={18} style={{marginRight: '8px', color: '#1877F2'}} />;
                        case 'LinkedIn':
                          return <FaLinkedin size={18} style={{marginRight: '8px', color: '#0A66C2'}} />;
                        case 'Success Corner':
                          return <FaBuilding size={18} style={{marginRight: '8px', color: '#FF6B6B'}} />;
                        case 'Interne':
                          return <FaUsers size={18} style={{marginRight: '8px', color: '#4CAF50'}} />;
                        case 'Speed Recruiting':
                          return <FaBuilding size={18} style={{marginRight: '8px', color: '#FFA500'}} />;
                        default:
                          return null;
                      }
                    };
                    
                    return (
                      <tr key={key}>
                        <td><strong style={{display: 'flex', alignItems: 'center'}}>{getSourceIcon(key)}{key}</strong></td>
                        <td>{data.candidatures}</td>
                        <td>{data.entretiensPlanifiés}</td>
                        <td>{data.entretiensRéalisés}</td>
                        <td>
                          <button type="button" onClick={() => editSource(key)} className="btn-edit-source"><FiEdit2 size={16} /></button>
                          <button type="button" onClick={() => removeSource(key)} className="btn-delete-source"><FiTrash2 size={16} /></button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* === SECTION 6: RÉCAPITULATIF === */}
        <div className="form-section">
          <h3>✅ Récapitulatif</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Total de Candidatures:</label>
              <input
                type="number"
                value={calculateTotalCandidatures()}
                readOnly
                className="readonly-input"
              />
            </div>
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
        </div>

        {/* === SECTION 7: COMMENTAIRES === */}
        <div className="form-section">
          <h3>💬 Commentaires</h3>
          <div className="form-group">
            <textarea
              name="comments"
              value={formData.comments}
              onChange={handleChange}
              rows="4"
              placeholder="Ajouter des notes..."
            />
          </div>
        </div>

        {/* === ACTIONS === */}
        <div className="form-actions">
          <button type="submit" disabled={loading} className="btn-save">
            {loading ? '⏳ Sauvegarde...' : '💾 Sauvegarder'}
          </button>
          <button type="button" onClick={onCancel} className="btn-cancel">
            ✕ Annuler
          </button>
        </div>
      </form>
    </div>
  );
}
