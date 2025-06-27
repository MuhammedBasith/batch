import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Download, Users, Shuffle, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

interface Group {
  id: number;
  members: string[];
}

const Index = () => {
  const [totalParticipants, setTotalParticipants] = useState<number>(10);
  const [teamSize, setTeamSize] = useState<number>(2);
  const [suspenseMode, setSuspenseMode] = useState<boolean>(false);
  const [useCustomNames, setUseCustomNames] = useState<boolean>(false);
  const [customNames, setCustomNames] = useState<string>('');
  const [groups, setGroups] = useState<Group[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [revealedGroups, setRevealedGroups] = useState<number>(0);
  const [groupPrefix, setGroupPrefix] = useState<string>('Team');
  const [showResultsModal, setShowResultsModal] = useState<boolean>(false);
  const [excludedParticipants, setExcludedParticipants] = useState<Set<string>>(new Set());
  const [distributeExtraRandomly, setDistributeExtraRandomly] = useState<boolean>(false);

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('batch-settings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setTotalParticipants(settings.totalParticipants || 10);
      setTeamSize(settings.teamSize || 2);
      setSuspenseMode(settings.suspenseMode || false);
      setUseCustomNames(settings.useCustomNames || false);
      setCustomNames(settings.customNames || '');
      setGroupPrefix(settings.groupPrefix || 'Team');
      setDistributeExtraRandomly(settings.distributeExtraRandomly || false);
    }
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        generateGroups();
      } else if (e.key === 'r' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        reshuffleGroups();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Save settings to localStorage
  const saveSettings = () => {
    const settings = {
      totalParticipants,
      teamSize,
      suspenseMode,
      useCustomNames,
      customNames,
      groupPrefix,
      distributeExtraRandomly
    };
    localStorage.setItem('batch-settings', JSON.stringify(settings));
  };

  // Create confetti effect
  const createConfetti = () => {
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
    const confettiCount = 50;
    
    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.left = Math.random() * 100 + 'vw';
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.width = Math.random() * 8 + 4 + 'px';
      confetti.style.height = confetti.style.width;
      confetti.style.animationDelay = Math.random() * 2 + 's';
      confetti.style.animationDuration = Math.random() * 2 + 3 + 's';
      
      document.body.appendChild(confetti);
      
      setTimeout(() => {
        confetti.remove();
      }, 5000);
    }
  };

  const getParticipantsList = () => {
    if (useCustomNames && customNames.trim()) {
      const names = customNames
        .split('\n')
        .map(name => name.trim())
        .filter(name => name.length > 0)
        .filter(name => !excludedParticipants.has(name));
      
      return names;
    } else {
      return Array.from({ length: totalParticipants }, (_, i) => `Person ${i + 1}`)
        .filter(name => !excludedParticipants.has(name));
    }
  };

  const generateGroups = () => {
    if (teamSize <= 0) {
      toast({
        title: "Invalid team size",
        description: "Team size must be greater than 0",
        variant: "destructive"
      });
      return;
    }

    const participants = getParticipantsList();
    
    if (participants.length === 0) {
      toast({
        title: "No participants",
        description: "Please add at least one participant",
        variant: "destructive"
      });
      return;
    }

    // Shuffle participants
    const shuffled = [...participants].sort(() => Math.random() - 0.5);
    
    // Create groups with even distribution
    const newGroups: Group[] = [];
    let groupId = 1;
    
    if (distributeExtraRandomly) {
      // Simple division - extras go to random groups
      const totalGroups = Math.ceil(shuffled.length / teamSize);
      
      for (let i = 0; i < totalGroups; i++) {
        newGroups.push({ id: groupId++, members: [] });
      }
      
      // Distribute participants randomly
      shuffled.forEach((participant, index) => {
        const groupIndex = index % totalGroups;
        newGroups[groupIndex].members.push(participant);
      });
    } else {
      // Balanced distribution
      const totalGroups = Math.ceil(shuffled.length / teamSize);
      const groupSizes = Array(totalGroups).fill(Math.floor(shuffled.length / totalGroups));
      const remainder = shuffled.length % totalGroups;
      
      // Distribute remainder
      for (let i = 0; i < remainder; i++) {
        groupSizes[i]++;
      }
      
      let participantIndex = 0;
      groupSizes.forEach(size => {
        const members = shuffled.slice(participantIndex, participantIndex + size);
        newGroups.push({ id: groupId++, members });
        participantIndex += size;
      });
    }

    setGroups(newGroups);
    setRevealedGroups(0);
    setIsGenerating(true);
    setShowResultsModal(true);
    saveSettings();

    if (suspenseMode) {
      // Reveal groups one by one
      let revealed = 0;
      const interval = setInterval(() => {
        revealed++;
        setRevealedGroups(revealed);
        
        if (revealed >= newGroups.length) {
          clearInterval(interval);
          setIsGenerating(false);
          createConfetti();
        }
      }, 800);
    } else {
      // Show all groups immediately
      setRevealedGroups(newGroups.length);
      setIsGenerating(false);
      createConfetti();
    }

    toast({
      title: "Groups generated!",
      description: `Created ${newGroups.length} ${groupPrefix.toLowerCase()}s successfully`,
    });
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const { source, destination } = result;
    
    if (source.droppableId === destination.droppableId) {
      // Reordering within the same group
      const groupId = parseInt(source.droppableId);
      const group = groups.find(g => g.id === groupId);
      if (!group) return;

      const newMembers = Array.from(group.members);
      const [reorderedItem] = newMembers.splice(source.index, 1);
      newMembers.splice(destination.index, 0, reorderedItem);

      setGroups(groups.map(g => 
        g.id === groupId ? { ...g, members: newMembers } : g
      ));
    } else {
      // Moving between groups
      const sourceGroupId = parseInt(source.droppableId);
      const destGroupId = parseInt(destination.droppableId);
      
      const sourceGroup = groups.find(g => g.id === sourceGroupId);
      const destGroup = groups.find(g => g.id === destGroupId);
      
      if (!sourceGroup || !destGroup) return;

      const sourceMember = sourceGroup.members[source.index];
      
      const newSourceMembers = [...sourceGroup.members];
      newSourceMembers.splice(source.index, 1);
      
      const newDestMembers = [...destGroup.members];
      newDestMembers.splice(destination.index, 0, sourceMember);

      setGroups(groups.map(g => {
        if (g.id === sourceGroupId) {
          return { ...g, members: newSourceMembers };
        } else if (g.id === destGroupId) {
          return { ...g, members: newDestMembers };
        }
        return g;
      }));
    }
  };

  const reshuffleGroups = () => {
    if (groups.length === 0) return;
    generateGroups();
  };

  const downloadGroups = () => {
    if (groups.length === 0) return;

    const content = groups
      .map(group => `${groupPrefix} ${group.id}:\n${group.members.map(member => `- ${member}`).join('\n')}`)
      .join('\n\n');
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'batch-groups.txt';
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Downloaded!",
      description: "Groups saved as batch-groups.txt",
    });
  };

  const effectiveParticipantCount = getParticipantsList().length;
  const estimatedGroups = Math.ceil(effectiveParticipantCount / teamSize);
  const baseGroupSize = Math.floor(effectiveParticipantCount / estimatedGroups);
  const extraParticipants = effectiveParticipantCount % estimatedGroups;

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        {/* Main Configuration Card */}
        <Card className="bg-white shadow-lg border border-gray-200">
          <CardHeader className="text-center pb-6">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-blue-500 rounded-xl">
                <Shuffle className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900">Batch</h1>
            </div>
            <p className="text-xl text-gray-600 mb-2">Beautifully random groups</p>
            <p className="text-sm text-gray-500">
              Press Ctrl+Enter to generate • Ctrl+R to reshuffle
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Custom Names Toggle */}
            <div className="flex items-center justify-between">
              <Label htmlFor="custom-names" className="text-gray-700 font-medium">Use custom names</Label>
              <Switch
                id="custom-names"
                checked={useCustomNames}
                onCheckedChange={setUseCustomNames}
              />
            </div>

            {/* Participants Input */}
            {useCustomNames ? (
              <div className="space-y-3">
                <Label htmlFor="names" className="text-gray-700 font-medium">
                  Participant names (one per line)
                </Label>
                <Textarea
                  id="names"
                  placeholder="Alice&#10;Bob&#10;Charlie&#10;Diana"
                  value={customNames}
                  onChange={(e) => setCustomNames(e.target.value)}
                  className="resize-none"
                  rows={6}
                />
                <p className="text-sm text-gray-500">
                  {getParticipantsList().length} participants
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <Label htmlFor="participants" className="text-gray-700 font-medium">Total participants</Label>
                <Input
                  id="participants"
                  type="number"
                  min="1"
                  value={totalParticipants}
                  onChange={(e) => setTotalParticipants(Number(e.target.value))}
                />
              </div>
            )}

            {/* Team Size */}
            <div className="space-y-3">
              <Label htmlFor="team-size" className="text-gray-700 font-medium">Team size</Label>
              <Input
                id="team-size"
                type="number"
                min="1"
                value={teamSize}
                onChange={(e) => setTeamSize(Number(e.target.value))}
              />
            </div>

            {/* Group Prefix */}
            <div className="space-y-3">
              <Label htmlFor="group-prefix" className="text-gray-700 font-medium">Group name prefix</Label>
              <Input
                id="group-prefix"
                value={groupPrefix}
                onChange={(e) => setGroupPrefix(e.target.value)}
                placeholder="Team"
              />
            </div>

            {/* Distribute Extra Randomly */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="distribute-extra" className="text-gray-700 font-medium">Distribute extras randomly</Label>
                <p className="text-sm text-gray-500">Put leftover participants in random groups</p>
              </div>
              <Switch
                id="distribute-extra"
                checked={distributeExtraRandomly}
                onCheckedChange={setDistributeExtraRandomly}
              />
            </div>

            {/* Suspense Mode */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="suspense-mode" className="text-gray-700 font-medium">Suspense mode</Label>
                <p className="text-sm text-gray-500">Reveal teams one by one</p>
              </div>
              <Switch
                id="suspense-mode"
                checked={suspenseMode}
                onCheckedChange={setSuspenseMode}
              />
            </div>

            {/* Stats */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <p className="text-gray-700">
                <span className="font-medium">Estimated groups:</span> {estimatedGroups}
              </p>
              <p className="text-gray-700">
                <span className="font-medium">Active participants:</span> {effectiveParticipantCount}
              </p>
              {extraParticipants > 0 && (
                <p className="text-gray-700">
                  <span className="font-medium">Group distribution:</span> {estimatedGroups - extraParticipants} groups of {baseGroupSize}, {extraParticipants} groups of {baseGroupSize + 1}
                </p>
              )}
            </div>

            {/* Generate Button */}
            <Button 
              onClick={generateGroups}
              disabled={isGenerating}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 text-lg transition-colors duration-200 hover:shadow-lg"
              size="lg"
            >
              {isGenerating ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Generating...
                </div>
              ) : (
                "Generate Groups"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Results Modal */}
      <Dialog open={showResultsModal} onOpenChange={setShowResultsModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center flex items-center justify-center gap-3">
              <Users className="w-6 h-6" />
              Generated {groupPrefix}s
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Action Buttons */}
            <div className="flex gap-3 justify-center">
              <Button
                onClick={reshuffleGroups}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Shuffle className="w-4 h-4" />
                Reshuffle
              </Button>
              <Button
                onClick={downloadGroups}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download
              </Button>
            </div>

            <p className="text-sm text-center text-gray-600">
              Drag and drop members between teams to reorganize
            </p>

            {/* Groups Grid with Drag and Drop */}
            <DragDropContext onDragEnd={onDragEnd}>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {groups.map((group, index) => (
                  <Card
                    key={group.id}
                    className={`transition-all duration-500 ${
                      index < revealedGroups 
                        ? 'opacity-100 translate-y-0' 
                        : 'opacity-0 translate-y-4'
                    }`}
                    style={{ 
                      transitionDelay: suspenseMode ? `${index * 100}ms` : '0ms' 
                    }}
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {group.id}
                        </div>
                        {groupPrefix} {group.id}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Droppable droppableId={group.id.toString()}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className={`space-y-2 min-h-[60px] rounded-lg p-2 transition-colors ${
                              snapshot.isDraggingOver ? 'bg-blue-50 border-2 border-blue-200 border-dashed' : ''
                            }`}
                          >
                            {group.members.map((member, memberIndex) => (
                              <Draggable key={member} draggableId={member} index={memberIndex}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className={`flex items-center gap-3 p-2 bg-gray-50 rounded-lg cursor-move transition-all ${
                                      snapshot.isDragging ? 'shadow-lg bg-white border-2 border-blue-200' : 'hover:bg-gray-100'
                                    }`}
                                  >
                                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                    <span className="text-gray-700">{member}</span>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </DragDropContext>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
