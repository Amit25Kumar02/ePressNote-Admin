import { useState } from "react";
import { Search, Filter, Plus, Edit, Trash2, BarChart3, Eye, X } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

interface PollOption {
  id: string;
  text: string;
  votes: number;
}

interface Poll {
  id: number;
  question: string;
  description: string;
  options: PollOption[];
  totalVotes: number;
  startDate: string;
  endDate: string;
  status: string;
  createdDate: string;
}

const polls: Poll[] = [
  {
    id: 1,
    question: "What type of perks would you like to see more of?",
    description: "Help us improve your experience by telling us which categories interest you most.",
    options: [
      { id: "1a", text: "Food & Dining", votes: 245 },
      { id: "1b", text: "Fitness & Wellness", votes: 189 },
      { id: "1c", text: "Entertainment", votes: 156 },
      { id: "1d", text: "Shopping & Retail", votes: 203 }
    ],
    totalVotes: 793,
    startDate: "2025-02-15",
    endDate: "2025-03-15",
    status: "Active",
    createdDate: "2025-02-10"
  },
  {
    id: 2,
    question: "How often do you use CRCL perks?",
    description: "Your feedback helps us understand user engagement patterns.",
    options: [
      { id: "2a", text: "Daily", votes: 98 },
      { id: "2b", text: "Weekly", votes: 234 },
      { id: "2c", text: "Monthly", votes: 167 },
      { id: "2d", text: "Rarely", votes: 45 }
    ],
    totalVotes: 544,
    startDate: "2025-02-01",
    endDate: "2025-02-28",
    status: "Closed",
    createdDate: "2025-01-25"
  },
  {
    id: 3,
    question: "Best time for exclusive offers?",
    description: "When would you prefer to receive special offers and deals?",
    options: [
      { id: "3a", text: "Weekdays", votes: 123 },
      { id: "3b", text: "Weekends", votes: 289 },
      { id: "3c", text: "No preference", votes: 87 }
    ],
    totalVotes: 499,
    startDate: "2025-03-01",
    endDate: "2025-03-31",
    status: "Active",
    createdDate: "2025-02-25"
  },
  {
    id: 4,
    question: "Rate our new app features",
    description: "Share your thoughts on the recently added features.",
    options: [
      { id: "4a", text: "Excellent", votes: 0 },
      { id: "4b", text: "Good", votes: 0 },
      { id: "4c", text: "Average", votes: 0 },
      { id: "4d", text: "Needs Improvement", votes: 0 }
    ],
    totalVotes: 0,
    startDate: "2025-03-20",
    endDate: "2025-04-20",
    status: "Scheduled",
    createdDate: "2025-03-05"
  },
];

export function VotingManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreatePollOpen, setIsCreatePollOpen] = useState(false);
  const [selectedPoll, setSelectedPoll] = useState<Poll | null>(null);
  const [newPoll, setNewPoll] = useState({
    question: "",
    description: "",
    options: ["", ""],
    startDate: "",
    endDate: ""
  });

  const addOption = () => {
    setNewPoll({...newPoll, options: [...newPoll.options, ""]});
  };

  const removeOption = (index: number) => {
    if (newPoll.options.length > 2) {
      const updatedOptions = newPoll.options.filter((_, i) => i !== index);
      setNewPoll({...newPoll, options: updatedOptions});
    }
  };

  const updateOption = (index: number, value: string) => {
    const updatedOptions = [...newPoll.options];
    updatedOptions[index] = value;
    setNewPoll({...newPoll, options: updatedOptions});
  };

  const handleCreatePoll = () => {
    // Mock implementation - in real app, would submit to backend
    console.log("Creating poll:", newPoll);
    setIsCreatePollOpen(false);
    setNewPoll({
      question: "",
      description: "",
      options: ["", ""],
      startDate: "",
      endDate: ""
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Voting & Polls Management</h1>
          <p className="text-muted-foreground mt-1">Create polls and view user responses</p>
        </div>
        <Dialog open={isCreatePollOpen} onOpenChange={setIsCreatePollOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Plus className="w-4 h-4 mr-2" />
              Create Poll
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Poll</DialogTitle>
              <DialogDescription>
                Create a poll to gather feedback from users
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="question">Poll Question</Label>
                <Input
                  id="question"
                  placeholder="e.g., What features do you want next?"
                  value={newPoll.question}
                  onChange={(e) => setNewPoll({...newPoll, question: e.target.value})}
                  className="bg-muted border-border"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Add context or details about this poll..."
                  value={newPoll.description}
                  onChange={(e) => setNewPoll({...newPoll, description: e.target.value})}
                  className="bg-muted border-border min-h-20"
                />
              </div>
              <div className="grid gap-2">
                <Label>Poll Options</Label>
                <div className="space-y-2">
                  {newPoll.options.map((option, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder={`Option ${index + 1}`}
                        value={option}
                        onChange={(e) => updateOption(index, e.target.value)}
                        className="bg-muted border-border"
                      />
                      {newPoll.options.length > 2 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeOption(index)}
                          className="border-border text-destructive hover:bg-destructive hover:text-destructive-foreground"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addOption}
                  className="border-border w-fit"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Option
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={newPoll.startDate}
                    onChange={(e) => setNewPoll({...newPoll, startDate: e.target.value})}
                    className="bg-muted border-border"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={newPoll.endDate}
                    onChange={(e) => setNewPoll({...newPoll, endDate: e.target.value})}
                    className="bg-muted border-border"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreatePollOpen(false)} className="border-border">
                Cancel
              </Button>
              <Button onClick={handleCreatePoll} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Create Poll
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6 bg-card border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Polls</p>
              <h2 className="mt-2">{polls.length}</h2>
            </div>
            <BarChart3 className="w-8 h-8 text-primary" />
          </div>
        </Card>
        <Card className="p-6 bg-card border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Polls</p>
              <h2 className="mt-2 text-primary">
                {polls.filter(p => p.status === "Active").length}
              </h2>
            </div>
            <Eye className="w-8 h-8 text-primary" />
          </div>
        </Card>
        <Card className="p-6 bg-card border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Votes</p>
              <h2 className="mt-2">
                {polls.reduce((sum, p) => sum + p.totalVotes, 0).toLocaleString()}
              </h2>
            </div>
            <BarChart3 className="w-8 h-8 text-muted-foreground" />
          </div>
        </Card>
        <Card className="p-6 bg-card border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Closed Polls</p>
              <h2 className="mt-2">{polls.filter(p => p.status === "Closed").length}</h2>
            </div>
            <BarChart3 className="w-8 h-8 text-muted-foreground" />
          </div>
        </Card>
      </div>

      <Card className="p-4 bg-card border-border">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search polls..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-muted border-border"
            />
          </div>
          <Button variant="outline" className="border-border">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="bg-card border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead>Question</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Votes</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {polls
                  .filter(poll => 
                    poll.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    poll.description.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((poll) => (
                    <TableRow 
                      key={poll.id} 
                      className="border-border cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedPoll(poll)}
                    >
                      <TableCell>
                        <div>
                          <p>{poll.question}</p>
                          {poll.description && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                              {poll.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{poll.startDate}</TableCell>
                      <TableCell className="text-muted-foreground">{poll.endDate}</TableCell>
                      <TableCell className="text-primary">{poll.totalVotes}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={poll.status === "Active" ? "default" : "secondary"}
                          className={poll.status === "Active" ? "bg-primary text-primary-foreground" : ""}
                        >
                          {poll.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" className="border-border">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="border-border text-destructive hover:bg-destructive hover:text-destructive-foreground"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </Card>

          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Showing {polls.length} of {polls.length} polls
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled className="border-border">
                Previous
              </Button>
              <Button variant="outline" size="sm" disabled className="border-border">
                Next
              </Button>
            </div>
          </div>
        </div>

        <div>
          <Card className="p-6 bg-card border-border sticky top-6">
            {selectedPoll ? (
              <div className="space-y-6">
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <h3>Poll Results</h3>
                    <Badge 
                      variant={selectedPoll.status === "Active" ? "default" : "secondary"}
                      className={selectedPoll.status === "Active" ? "bg-primary text-primary-foreground" : ""}
                    >
                      {selectedPoll.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{selectedPoll.question}</p>
                  {selectedPoll.description && (
                    <p className="text-sm text-muted-foreground mt-2">{selectedPoll.description}</p>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm">Total Votes</p>
                    <p className="text-primary">{selectedPoll.totalVotes.toLocaleString()}</p>
                  </div>

                  <div className="space-y-3">
                    {selectedPoll.options.map((option) => {
                      const percentage = selectedPoll.totalVotes > 0 
                        ? (option.votes / selectedPoll.totalVotes) * 100 
                        : 0;
                      
                      return (
                        <div key={option.id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="text-sm">{option.text}</p>
                            <p className="text-sm text-muted-foreground">
                              {option.votes} ({percentage.toFixed(1)}%)
                            </p>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-4 border-t border-border space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Start Date</span>
                    <span>{selectedPoll.startDate}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">End Date</span>
                    <span>{selectedPoll.endDate}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Created</span>
                    <span>{selectedPoll.createdDate}</span>
                  </div>
                </div>

                <div className="space-y-2 pt-4">
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    View Detailed Analytics
                  </Button>
                  <Button variant="outline" className="w-full border-border">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Poll
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Select a poll to view results</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
