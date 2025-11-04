import React, { useState, useReducer, useMemo } from 'react';
import { taxDataReducer, initialTaxData } from './state/reducer';
import { calculateTax } from './services/taxCalculator';
import { ASSESSMENT_YEARS, INCOME_HEADS } from './constants';
import StartHere from './sections/StartHere';
import Salary from './sections/Salary';
import HouseProperty from './sections/HouseProperty';
import PGBP from './sections/PGBP';
import CapitalGains from './sections/CapitalGains';
import OtherSources from './sections/OtherSources';
import Deductions from './sections/Deductions';
import TaxSummary from './sections/TaxSummary';

export default function App() {
  const [activeTab, setActiveTab] = useState('Start Here');
  const [taxData, dispatch] = useReducer(taxDataReducer, initialTaxData);
  const [panError, setPanError] = useState('');
  const [selectedIncomeHeads, setSelectedIncomeHeads] = useState<Set<string>>(new Set());

  const handlePanChange = (pan: string) => {
    const upperPan = pan.toUpperCase();
    dispatch({type: 'UPDATE_FIELD', payload: {path: 'pan', value: upperPan}});
    const panRegex = /[A-Z]{5}[0-9]{4}[A-Z]{1}/;
    if (upperPan && !panRegex.test(upperPan)) {
        setPanError('Invalid PAN format. Should be ABCDE1234F.');
    } else {
        setPanError('');
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all data? This action cannot be undone.')) {
      dispatch({ type: 'RESET_STATE', payload: initialTaxData });
      setSelectedIncomeHeads(new Set());
      setPanError('');
      setActiveTab('Start Here');
    }
  };
  
  const handleIncomeHeadToggle = (head: string) => {
    setSelectedIncomeHeads(prev => {
        const newSet = new Set(prev);
        if (newSet.has(head)) {
            newSet.delete(head);
            if(activeTab === head) {
                setActiveTab('Start Here');
            }
        } else {
            newSet.add(head);
        }
        return newSet;
    });
  };

  const computationResult = useMemo(() => calculateTax(taxData), [taxData]);

  const dynamicTabs = useMemo(() => {
    const sortedHeads = INCOME_HEADS.filter(head => selectedIncomeHeads.has(head));
    return ['Start Here', ...sortedHeads, 'Deductions', 'Tax Summary'];
  }, [selectedIncomeHeads]);

  const renderContent = () => {
    switch (activeTab) {
      case 'Start Here':
        return (
            <StartHere
                taxData={taxData}
                dispatch={dispatch}
                panError={panError}
                handlePanChange={handlePanChange}
                selectedIncomeHeads={selectedIncomeHeads}
                handleIncomeHeadToggle={handleIncomeHeadToggle}
            />
        );
      case 'Salary':
        return <Salary taxData={taxData} dispatch={dispatch} />;
      case 'House Property':
        return <HouseProperty />;
       case 'PGBP':
        return <PGBP />;
       case 'Capital Gains':
        return <CapitalGains />;
       case 'Other Sources':
        return <OtherSources />;
      case 'Deductions':
        return <Deductions taxData={taxData} dispatch={dispatch} />;
      case 'Tax Summary':
        return <TaxSummary data={taxData} result={computationResult} />;
      default:
        return <div>Select a tab</div>;
    }
  };

  return (
    <div className="min-h-screen font-sans">
      <header className="bg-white shadow-md p-4 no-print">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
             <h1 className="text-xl md:text-2xl font-bold text-gray-800 text-center md:text-left">Income Tax Calculator</h1>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto justify-center">
             <select value={taxData.assessmentYear} onChange={e => dispatch({type: 'UPDATE_FIELD', payload: {path: 'assessmentYear', value: e.target.value}})} className="p-2 border rounded-md font-semibold bg-gray-50 w-full md:w-auto flex-grow">
                {ASSESSMENT_YEARS.map(year => <option key={year} value={year}>{year}</option>)}
             </select>
             <button onClick={handleReset} className="text-sm bg-red-600 text-white px-3 py-2 rounded-md hover:bg-red-700 transition-colors flex-shrink-0">Reset</button>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto p-4 md:p-8">
        <nav className="mb-4 md:mb-8 overflow-x-auto whitespace-nowrap no-print">
          <ul className="flex border-b">
            {dynamicTabs.map(tab => (
              <li key={tab} className="-mb-px mr-1">
                <button
                  onClick={() => setActiveTab(tab)}
                  className={`inline-block py-2 px-3 md:px-4 text-sm md:text-base font-semibold ${activeTab === tab ? 'text-blue-600 border-l border-t border-r rounded-t' : 'text-gray-500 hover:text-blue-800'}`}
                >
                  {tab}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <div>{renderContent()}</div>
      </main>
    </div>
  );
}