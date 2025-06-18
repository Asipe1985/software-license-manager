import React, { useState } from 'react';
import { Search, Plus, ExternalLink, ArrowRight, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

const SimpleLicenseManager = () => {
  const [activeTab, setActiveTab] = useState('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showArchiveForm, setShowArchiveForm] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [archiveReason, setArchiveReason] = useState('Ukončeno uživatelem');
  const [editingProduct, setEditingProduct] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  
  const [products, setProducts] = useState([
    {
      id: 1,
      name: "Antivirus Premium",
      category: "Bezpečnostní SW",
      license: "Enterprise",
      licenseCount: 50,
      supportStart: "2024-07-15",
      supportEnd: "2025-07-15",
      vendor: "Symantec",
      supplier: "AUTOCONT a.s.",
      cost: 15000,
      responsible: "Jan Novák",
      location: "Praha",
      status: "Aktivní",
      requestNumber: "ŽAD1233/2024",
      requestUrl: "https://helpdesk.firma.cz/ticket/1233",
      replacesProductId: 101,
      documents: [
        { id: 1, name: "Faktura_Antivirus_Premium.pdf", size: "245 KB", uploadDate: "2024-07-15" },
        { id: 2, name: "Certifikat_Symantec.pdf", size: "1.2 MB", uploadDate: "2024-07-10" }
      ]
    },
    {
      id: 2,
      name: "Office Suite Pro",
      category: "Kancelářský SW",
      license: "Volume",
      licenseCount: 100,
      supportStart: "2024-06-20",
      supportEnd: "2025-06-20",
      vendor: "Microsoft",
      supplier: "T-Systems",
      cost: 25000,
      responsible: "Marie Svobodová",
      location: "Brno",
      status: "Aktivní",
      requestNumber: "ŽAD0987/2024",
      requestUrl: "https://helpdesk.firma.cz/ticket/987",
      documents: [
        { id: 3, name: "Office365_Faktura.pdf", size: "189 KB", uploadDate: "2024-06-20" }
      ]
    },
    {
      id: 101,
      name: "Antivirus Basic",
      category: "Bezpečnostní SW",
      license: "Standard",
      licenseCount: 30,
      supportStart: "2022-01-15",
      supportEnd: "2024-01-15",
      vendor: "Symantec",
      supplier: "AUTOCONT a.s.",
      cost: 8000,
      responsible: "Jan Novák",
      location: "Praha",
      status: "Ukončený",
      requestNumber: "ŽAD0445/2022",
      requestUrl: "https://helpdesk.firma.cz/ticket/445",
      replacedByProductId: 1,
      endDate: "2024-07-15",
      endReason: "Upgrade na Premium verzi",
      documents: [
        { id: 4, name: "Antivirus_Basic_Faktura.pdf", size: "198 KB", uploadDate: "2022-01-15" }
      ]
    }
  ]);

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    license: '',
    licenseCount: '',
    supportStart: '',
    supportEnd: '',
    vendor: '',
    supplier: '',
    cost: '',
    responsible: '',
    location: '',
    status: 'Aktivní',
    requestNumber: '',
    requestUrl: '',
    replacesProductId: null,
    documents: []
  });

  const activeProducts = products.filter(p => p.status === 'Aktivní' || p.status === 'Připravuje se');
  const historyProducts = products.filter(p => p.status === 'Ukončený' || p.status === 'Neaktivní');

  const getExpiryStatus = (endDate) => {
    const today = new Date();
    const expiry = new Date(endDate);
    const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) return { status: 'expired', days: Math.abs(daysUntilExpiry), color: 'text-red-600 bg-red-50', text: `Vypršelo před ${Math.abs(daysUntilExpiry)} dny` };
    if (daysUntilExpiry <= 30) return { status: 'critical', days: daysUntilExpiry, color: 'text-red-600 bg-red-50', text: `Vyprší za ${daysUntilExpiry} dní` };
    if (daysUntilExpiry <= 60) return { status: 'warning', days: daysUntilExpiry, color: 'text-orange-600 bg-orange-50', text: `Vyprší za ${daysUntilExpiry} dní` };
    return { status: 'ok', days: daysUntilExpiry, color: 'text-green-600 bg-green-50', text: `Vyprší za ${daysUntilExpiry} dní` };
  };

  const getStatusIcon = (status) => {
    if (status === 'expired' || status === 'critical') return <XCircle className="w-4 h-4 text-red-500" />;
    if (status === 'warning') return <AlertTriangle className="w-4 h-4 text-orange-500" />;
    return <CheckCircle className="w-4 h-4 text-green-500" />;
  };

  const getProductById = (productId) => {
    return products.find(p => p.id === productId);
  };

  const handleAddProduct = () => {
    const newProduct = {
      ...formData,
      id: Math.max(...products.map(p => p.id)) + 1,
      cost: parseFloat(formData.cost) || 0,
      licenseCount: parseInt(formData.licenseCount) || 0,
      replacesProductId: formData.replacesProductId ? parseInt(formData.replacesProductId) : null,
      documents: [...uploadedFiles]
    };
    
    let updatedProducts = [...products, newProduct];
    
    // Pokud nahrazuje nějaký produkt, označíme původní jako nahrazený
    if (newProduct.replacesProductId) {
      updatedProducts = updatedProducts.map(p => 
        p.id === newProduct.replacesProductId 
          ? { ...p, replacedByProductId: newProduct.id }
          : p
      );
    }
    
    setProducts(updatedProducts);
    resetForm();
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product.id);
    setFormData({
      ...product,
      cost: product.cost.toString(),
      licenseCount: product.licenseCount.toString(),
      replacesProductId: product.replacesProductId || null
    });
    setUploadedFiles([...(product.documents || [])]);
    setShowAddForm(true);
  };

  const handleUpdateProduct = () => {
    const updatedProduct = {
      ...formData,
      id: editingProduct,
      cost: parseFloat(formData.cost) || 0,
      licenseCount: parseInt(formData.licenseCount) || 0,
      replacesProductId: formData.replacesProductId ? parseInt(formData.replacesProductId) : null,
      documents: [...uploadedFiles]
    };
    
    let updatedProducts = products.map(p => 
      p.id === editingProduct ? updatedProduct : p
    );
    
    // Pokud nahrazuje nějaký produkt, označíme původní jako nahrazený
    if (updatedProduct.replacesProductId) {
      updatedProducts = updatedProducts.map(p => 
        p.id === updatedProduct.replacesProductId 
          ? { ...p, replacedByProductId: updatedProduct.id }
          : p
      );
    }
    
    setProducts(updatedProducts);
    resetForm();
  };

  const handleArchiveProduct = (id) => {
    setSelectedProductId(id);
    setShowArchiveForm(true);
  };

  const confirmArchive = () => {
    const updatedProducts = products.map(p => 
      p.id === selectedProductId 
        ? { 
            ...p, 
            status: 'Ukončený', 
            endDate: new Date().toISOString().split('T')[0],
            endReason: archiveReason
          }
        : p
    );
    setProducts(updatedProducts);
    setShowArchiveForm(false);
    setSelectedProductId(null);
    setArchiveReason('Ukončeno uživatelem');
  };

  const handleDeleteProduct = (id) => {
    setSelectedProductId(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    const filteredProducts = products.filter(p => p.id !== selectedProductId);
    setProducts(filteredProducts);
    setShowDeleteConfirm(false);
    setSelectedProductId(null);
  };

  const resetForm = () => {
    setFormData({
      name: '', category: '', license: '', licenseCount: '', supportStart: '',
      supportEnd: '', vendor: '', supplier: '', cost: '', responsible: '',
      location: '', status: 'Aktivní', requestNumber: '', requestUrl: '',
      replacesProductId: null, documents: []
    });
    setUploadedFiles([]);
    setShowAddForm(false);
    setEditingProduct(null);
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    
    files.forEach(file => {
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        const newFile = {
          id: Date.now() + Math.random(),
          name: file.name,
          size: `${(file.size / 1024).toFixed(0)} KB`,
          uploadDate: new Date().toISOString().split('T')[0],
          file: file
        };
        
        setUploadedFiles(prev => [...prev, newFile]);
      } else {
        alert('Podporovány jsou pouze PDF soubory');
      }
    });
    
    event.target.value = '';
  };

  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const downloadFile = (file) => {
    alert(`Stahování souboru: ${file.name}\nV reálné aplikaci by se soubor stáhl ze serveru.`);
  };

  const filteredProducts = (activeTab === 'active' ? activeProducts : historyProducts)
    .filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.requestNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Správa produktů a licencí</h1>
            
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-4">
              <button
                onClick={() => setActiveTab('active')}
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  activeTab === 'active' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
                }`}
              >
                Aktivní produkty ({activeProducts.length})
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  activeTab === 'history' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
                }`}
              >
                Historie ({historyProducts.length})
              </button>
            </div>
          </div>
          
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Přidat produkt
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Hledat produkty, žádanky..."
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {activeTab === 'active' && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  )}

        {/* Archive Modal */}
        {showArchiveForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Vyřadit produkt do historie</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Důvod vyřazení:
                </label>
                <input
                  type="text"
                  value={archiveReason}
                  onChange={(e) => setArchiveReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="např. Ukončena smlouva, Nahrazeno novým systémem..."
                />
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowArchiveForm(false);
                    setSelectedProductId(null);
                    setArchiveReason('Ukončeno uživatelem');
                  }}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Zrušit
                </button>
                <button
                  onClick={confirmArchive}
                  className="px-4 py-2 text-white bg-orange-600 rounded-lg hover:bg-orange-700"
                >
                  Vyřadit do historie
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Smazat produkt</h3>
              
              <p className="text-sm text-gray-600 mb-6">
                Opravdu chcete trvale smazat tento produkt? Tuto akci nelze vrátit zpět.
              </p>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setSelectedProductId(null);
                  }}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Zrušit
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700"
                >
                  Smazat
                </button>
              </div>
            </div>
          </div>
        )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produkt</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Žádanka</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategorie</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vztahy</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Platnost</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Výrobce</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Odpovědný</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dokumenty</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cena</th>
                  {activeTab === 'active' && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Akce</th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => {
                  const expiryInfo = activeTab === 'active' ? getExpiryStatus(product.supportEnd) : null;
                  
                  return (
                    <tr key={product.id} className="hover:bg-gray-50">
                      {activeTab === 'active' && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(expiryInfo.status)}
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${expiryInfo.color}`}>
                              {expiryInfo.text}
                            </span>
                          </div>
                        </td>
                      )}
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        <div className="text-xs text-blue-600">{product.licenseCount}x {product.license}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {product.requestNumber ? (
                          <div>
                            <div className="text-sm font-medium text-blue-600">{product.requestNumber}</div>
                            {product.requestUrl && (
                              <a href={product.requestUrl} target="_blank" rel="noopener noreferrer"
                                 className="inline-flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700">
                                <ExternalLink className="w-3 h-3" />
                                Otevřít
                              </a>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">Bez žádanky</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{product.category}</td>
                      <td className="px-6 py-4">
                        {product.replacesProductId && (
                          <div className="text-xs bg-blue-50 px-2 py-1 rounded mb-1">
                            <ArrowRight className="w-3 h-3 inline mr-1 text-blue-600" />
                            <span className="text-blue-700">Nahrazuje: {getProductById(product.replacesProductId)?.name}</span>
                          </div>
                        )}
                        {product.replacedByProductId && (
                          <div className="text-xs bg-orange-50 px-2 py-1 rounded">
                            <ArrowRight className="w-3 h-3 inline mr-1 text-orange-600" />
                            <span className="text-orange-700">Nahrazeno: {getProductById(product.replacedByProductId)?.name}</span>
                          </div>
                        )}
                        {!product.replacesProductId && !product.replacedByProductId && (
                          <span className="text-xs text-gray-400">Žádné vazby</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div>{new Date(product.supportStart).toLocaleDateString('cs-CZ')}</div>
                        <div>do: {new Date(activeTab === 'active' ? product.supportEnd : product.endDate || product.supportEnd).toLocaleDateString('cs-CZ')}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div>{product.vendor}</div>
                        <div className="text-xs text-gray-500">{product.supplier}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div>{product.responsible}</div>
                        <div className="text-xs text-gray-500">{product.location}</div>
                      </td>
                      <td className="px-6 py-4">
                        {product.documents && product.documents.length > 0 ? (
                          <div>
                            <div className="text-sm text-gray-900 mb-1">{product.documents.length} dokumentů</div>
                            {product.documents.slice(0, 2).map(doc => (
                              <div key={doc.id} className="text-xs text-blue-600 cursor-pointer hover:text-blue-800 mb-1"
                                   onClick={() => downloadFile(doc)}>
                                📄 {doc.name} ({doc.size})
                              </div>
                            ))}
                            {product.documents.length > 2 && (
                              <div className="text-xs text-gray-500">+{product.documents.length - 2} dalších</div>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">Žádné dokumenty</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {product.cost.toLocaleString('cs-CZ')} Kč
                      </td>
                      {activeTab === 'active' && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex flex-col gap-1">
                            <button
                              onClick={() => handleEditProduct(product)}
                              className="text-blue-600 hover:text-blue-900 text-left"
                            >
                              Upravit
                            </button>
                            <button
                              onClick={() => handleArchiveProduct(product.id)}
                              className="text-orange-600 hover:text-orange-900 text-left"
                            >
                              Vyřadit
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="text-red-600 hover:text-red-900 text-left"
                            >
                              Smazat
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {activeTab === 'active' ? 'Souhrn aktivních produktů' : 'Souhrn historie'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {filteredProducts.length}
              </div>
              <div className="text-sm text-gray-500">Produktů</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {filteredProducts.reduce((sum, p) => sum + p.cost, 0).toLocaleString('cs-CZ')}
              </div>
              <div className="text-sm text-gray-500">Celková hodnota (Kč)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {filteredProducts.filter(p => p.replacesProductId || p.replacedByProductId).length}
              </div>
              <div className="text-sm text-gray-500">S vazbami</div>
            </div>
          </div>
        </div>

        {showAddForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl max-h-screen overflow-y-auto">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingProduct ? 'Upravit produkt' : 'Přidat nový produkt'}
              </h3>
              
              <div className="grid grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Název produktu"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Kategorie"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Typ licence"
                  value={formData.license}
                  onChange={(e) => setFormData({...formData, license: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="number"
                  placeholder="Počet licencí"
                  value={formData.licenseCount}
                  onChange={(e) => setFormData({...formData, licenseCount: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="date"
                  placeholder="Platnost od"
                  value={formData.supportStart}
                  onChange={(e) => setFormData({...formData, supportStart: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="date"
                  placeholder="Platnost do"
                  value={formData.supportEnd}
                  onChange={(e) => setFormData({...formData, supportEnd: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Výrobce"
                  value={formData.vendor}
                  onChange={(e) => setFormData({...formData, vendor: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Dodavatel"
                  value={formData.supplier}
                  onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="number"
                  placeholder="Cena (Kč)"
                  value={formData.cost}
                  onChange={(e) => setFormData({...formData, cost: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Odpovědná osoba"
                  value={formData.responsible}
                  onChange={(e) => setFormData({...formData, responsible: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Lokace"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Číslo žádanky"
                  value={formData.requestNumber}
                  onChange={(e) => setFormData({...formData, requestNumber: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              
              <div className="mt-4">
                <input
                  type="url"
                  placeholder="URL žádanky"
                  value={formData.requestUrl}
                  onChange={(e) => setFormData({...formData, requestUrl: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nahrazuje produkt (volitelné):
                </label>
                <select
                  value={formData.replacesProductId || ''}
                  onChange={(e) => setFormData({...formData, replacesProductId: e.target.value || null})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Nenahrazuje žádný produkt</option>
                  {products
                    .filter(p => p.id !== editingProduct && (p.status === 'Aktivní' || p.status === 'Ukončený' || p.status === 'Neaktivní'))
                    .map(product => (
                      <option key={product.id} value={product.id}>
                        {product.name} ({product.license}) - {product.status}
                      </option>
                    ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Vyberte produkt, který tento nový produkt nahrazuje (např. při upgradu nebo migraci)
                </p>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dokumenty (PDF):
                </label>
                <input
                  type="file"
                  multiple
                  accept=".pdf"
                  onChange={handleFileUpload}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Nahrávejte faktury, certifikáty a další dokumenty ve formátu PDF
                </p>
                
                {uploadedFiles.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">Nahrané soubory:</h4>
                    {uploadedFiles.map(file => (
                      <div key={file.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center">
                          <span className="mr-2">📄</span>
                          <div>
                            <div className="text-sm font-medium">{file.name}</div>
                            <div className="text-xs text-gray-500">{file.size} • {file.uploadDate}</div>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFile(file.id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Smazat
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={resetForm}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Zrušit
                </button>
                <button
                  onClick={editingProduct ? handleUpdateProduct : handleAddProduct}
                  className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  {editingProduct ? 'Uložit změny' : 'Přidat produkt'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleLicenseManager;