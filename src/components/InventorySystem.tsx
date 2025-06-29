'use client';

import { useState, useEffect } from 'react';
import { Package, Star, Zap, Gift, Trash2, Eye, Filter } from 'lucide-react';

interface InventoryItem {
  id: string;
  name: string;
  emoji: string;
  type: 'ingredient' | 'tool' | 'boost' | 'collectible';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  description: string;
  quantity: number;
  source: string; // How it was obtained
  dateObtained: Date;
  effect?: string; // For items with special effects
}

interface InventorySystemProps {
  playerLevel: number;
  onItemUsed: (item: InventoryItem) => void;
}

export default function InventorySystem({ playerLevel, onItemUsed }: InventorySystemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'ingredient' | 'tool' | 'boost' | 'collectible'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'rarity' | 'quantity' | 'date'>('date');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  // Initialize inventory with some starter items
  useEffect(() => {
    const savedInventory = localStorage.getItem('memechef-inventory');
    if (savedInventory) {
      const parsed = JSON.parse(savedInventory);
      const inventoryWithDates = parsed.map((item: any) => ({
        ...item,
        dateObtained: new Date(item.dateObtained)
      }));
      setInventory(inventoryWithDates);
    } else {
      // Give player starter items
      const starterItems: InventoryItem[] = [
        {
          id: 'starter-knife',
          name: 'Rusty Knife',
          emoji: '🔪',
          type: 'tool',
          rarity: 'common',
          description: 'A well-worn knife. It\'s seen better days, but it still cuts!',
          quantity: 1,
          source: 'Starter Kit',
          dateObtained: new Date(),
          effect: 'Slightly faster recipe generation'
        },
        {
          id: 'mystery-spice',
          name: 'Mystery Spice',
          emoji: '🌟',
          type: 'ingredient',
          rarity: 'rare',
          description: 'A mysterious spice that adds unexpected flavors to any dish.',
          quantity: 3,
          source: 'Welcome Gift',
          dateObtained: new Date()
        },
        {
          id: 'chaos-multiplier',
          name: 'Chaos Multiplier',
          emoji: '⚡',
          type: 'boost',
          rarity: 'epic',
          description: 'Doubles XP from the next chaos click!',
          quantity: 1,
          source: 'Tutorial Reward',
          dateObtained: new Date(),
          effect: '2x chaos XP (single use)'
        }
      ];
      setInventory(starterItems);
      localStorage.setItem('memechef-inventory', JSON.stringify(starterItems));
    }
  }, []);

  // Save inventory changes
  useEffect(() => {
    localStorage.setItem('memechef-inventory', JSON.stringify(inventory));
  }, [inventory]);

  // Add item to inventory (this would be called from other parts of the game)
  const addItem = (item: Omit<InventoryItem, 'id' | 'dateObtained'>) => {
    const existingItem = inventory.find(i => i.name === item.name);
    
    if (existingItem) {
      setInventory(prev => prev.map(i => 
        i.id === existingItem.id 
          ? { ...i, quantity: i.quantity + item.quantity }
          : i
      ));
    } else {
      const newItem: InventoryItem = {
        ...item,
        id: `item-${Date.now()}`,
        dateObtained: new Date()
      };
      setInventory(prev => [...prev, newItem]);
    }
  };

  const useItem = (item: InventoryItem) => {
    if (item.quantity <= 0) return;

    // Reduce quantity
    setInventory(prev => prev.map(i => 
      i.id === item.id 
        ? { ...i, quantity: i.quantity - 1 }
        : i
    ).filter(i => i.quantity > 0));

    onItemUsed(item);
    setSelectedItem(null);
  };

  const deleteItem = (itemId: string) => {
    setInventory(prev => prev.filter(i => i.id !== itemId));
    setSelectedItem(null);
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'from-gray-400 to-gray-500';
      case 'rare': return 'from-blue-400 to-blue-500';
      case 'epic': return 'from-purple-400 to-purple-500';
      case 'legendary': return 'from-yellow-400 to-orange-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  const getRarityBorder = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-400/40';
      case 'rare': return 'border-blue-400/40';
      case 'epic': return 'border-purple-400/40';
      case 'legendary': return 'border-yellow-400/40';
      default: return 'border-gray-400/40';
    }
  };

  // Filter and sort inventory
  const filteredInventory = inventory
    .filter(item => selectedFilter === 'all' || item.type === selectedFilter)
    .sort((a, b) => {
      switch (sortBy) {
        case 'name': return a.name.localeCompare(b.name);
        case 'rarity': 
          const rarityOrder = { common: 1, rare: 2, epic: 3, legendary: 4 };
          return (rarityOrder[b.rarity] || 0) - (rarityOrder[a.rarity] || 0);
        case 'quantity': return b.quantity - a.quantity;
        case 'date': return b.dateObtained.getTime() - a.dateObtained.getTime();
        default: return 0;
      }
    });

  const totalItems = inventory.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      {/* Inventory Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-68 right-4 z-40 backdrop-blur-xl bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border-2 border-purple-400/40 rounded-2xl p-4 hover:scale-105 transition-all duration-300"
      >
        <div className="flex items-center space-x-2">
          <Package className="text-purple-400" size={20} />
          <span className="text-white font-bold text-sm">Items</span>
        </div>
        <div className="text-xs text-white/70 text-center mt-1">
          {totalItems} items
        </div>
      </button>

      {/* Inventory Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="backdrop-blur-xl bg-gradient-to-br from-purple-900/90 to-indigo-900/90 border border-white/20 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-white/20">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
                  <Package className="text-purple-400" size={28} />
                  <span>Inventory</span>
                  <span className="text-purple-400 text-lg">({totalItems})</span>
                </h2>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setSelectedItem(null);
                  }}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Filters and Sort */}
              <div className="flex flex-wrap gap-3">
                <div className="flex gap-2">
                  {[
                    { id: 'all', label: '📦 All', count: inventory.length },
                    { id: 'ingredient', label: '🥕 Ingredients', count: inventory.filter(i => i.type === 'ingredient').length },
                    { id: 'tool', label: '🔧 Tools', count: inventory.filter(i => i.type === 'tool').length },
                    { id: 'boost', label: '⚡ Boosts', count: inventory.filter(i => i.type === 'boost').length },
                    { id: 'collectible', label: '✨ Collectibles', count: inventory.filter(i => i.type === 'collectible').length }
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => setSelectedFilter(filter.id as any)}
                      className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                        selectedFilter === filter.id
                          ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg'
                          : 'bg-white/10 text-white/70 hover:bg-white/20'
                      }`}
                    >
                      {filter.label} ({filter.count})
                    </button>
                  ))}
                </div>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-white/10 border border-white/20 rounded-xl text-white px-3 py-2 text-sm focus:outline-none focus:border-purple-400/60"
                >
                  <option value="date">📅 Newest First</option>
                  <option value="name">🔤 Name</option>
                  <option value="rarity">⭐ Rarity</option>
                  <option value="quantity">📊 Quantity</option>
                </select>
              </div>
            </div>

            {/* Inventory Grid */}
            <div className="p-6 max-h-[calc(90vh-180px)] overflow-y-auto">
              {selectedItem ? (
                /* Item Detail View */
                <div className="space-y-6">
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="text-purple-400 hover:text-purple-300 transition-colors flex items-center space-x-2"
                  >
                    <span>←</span>
                    <span>Back to Inventory</span>
                  </button>

                  <div className={`backdrop-blur-xl bg-gradient-to-br ${getRarityColor(selectedItem.rarity)}/20 border-2 ${getRarityBorder(selectedItem.rarity)} rounded-3xl p-8`}>
                    <div className="text-center mb-6">
                      <div className="text-6xl mb-4">{selectedItem.emoji}</div>
                      <h3 className="text-3xl font-bold text-white mb-2">{selectedItem.name}</h3>
                      <div className={`inline-block px-3 py-1 rounded-full text-sm font-bold text-white capitalize bg-gradient-to-r ${getRarityColor(selectedItem.rarity)}`}>
                        {selectedItem.rarity}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-white font-bold mb-2">Description</h4>
                          <p className="text-white/80">{selectedItem.description}</p>
                        </div>

                        {selectedItem.effect && (
                          <div>
                            <h4 className="text-white font-bold mb-2">Effect</h4>
                            <p className="text-green-400">{selectedItem.effect}</p>
                          </div>
                        )}
                      </div>

                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-white/10 rounded-xl p-3 text-center">
                            <div className="text-2xl font-bold text-white">{selectedItem.quantity}</div>
                            <div className="text-white/60 text-sm">Quantity</div>
                          </div>
                          <div className="bg-white/10 rounded-xl p-3 text-center">
                            <div className="text-lg font-bold text-white capitalize">{selectedItem.type}</div>
                            <div className="text-white/60 text-sm">Type</div>
                          </div>
                        </div>

                        <div className="bg-white/10 rounded-xl p-4">
                          <div className="text-white/60 text-sm space-y-1">
                            <div>Source: {selectedItem.source}</div>
                            <div>Obtained: {selectedItem.dateObtained.toLocaleDateString()}</div>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          {(selectedItem.type === 'boost' || selectedItem.type === 'ingredient') && (
                            <button
                              onClick={() => useItem(selectedItem)}
                              className="flex-1 px-4 py-3 bg-green-500/20 text-green-400 border border-green-400/40 rounded-xl hover:bg-green-500/30 transition-colors font-bold"
                            >
                              Use Item
                            </button>
                          )}
                          <button
                            onClick={() => deleteItem(selectedItem.id)}
                            className="px-4 py-3 bg-red-500/20 text-red-400 border border-red-400/40 rounded-xl hover:bg-red-500/30 transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Inventory Grid View */
                <>
                  {filteredInventory.length === 0 ? (
                    <div className="text-center py-12">
                      <Package className="text-white/40 mx-auto mb-4" size={48} />
                      <p className="text-white/60 text-lg">No items found</p>
                      <p className="text-white/40 text-sm">
                        {selectedFilter === 'all' 
                          ? 'Your inventory is empty!' 
                          : `No ${selectedFilter} items found.`}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {filteredInventory.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => setSelectedItem(item)}
                          className={`relative backdrop-blur-sm bg-white/10 border ${getRarityBorder(item.rarity)} rounded-2xl p-4 hover:bg-white/20 transition-all duration-300 cursor-pointer group`}
                        >
                          {/* Rarity indicator */}
                          <div className={`absolute top-2 right-2 w-3 h-3 rounded-full bg-gradient-to-r ${getRarityColor(item.rarity)}`}></div>

                          {/* Item Icon */}
                          <div className="text-center mb-3">
                            <div className="text-3xl mb-2">{item.emoji}</div>
                            <h4 className="text-white font-bold text-sm truncate">{item.name}</h4>
                          </div>

                          {/* Quantity */}
                          <div className="absolute bottom-2 right-2">
                            <div className="bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                              {item.quantity}
                            </div>
                          </div>

                          {/* Type indicator */}
                          <div className="absolute bottom-2 left-2">
                            <div className="text-xs text-white/60">
                              {item.type === 'ingredient' && '🥕'}
                              {item.type === 'tool' && '🔧'}
                              {item.type === 'boost' && '⚡'}
                              {item.type === 'collectible' && '✨'}
                            </div>
                          </div>

                          {/* Hover effect */}
                          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/5 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
