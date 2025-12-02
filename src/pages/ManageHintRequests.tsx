import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { Home, Trophy, LogOut, CheckCircle, XCircle, Clock, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";

type HintRequest = {
  id: string;
  team: {
    id: string;
    name: string;
    email: string;
  };
  roundNumber: number;
  assignment: {
    id: string;
    roundNumber: number;
    clueText: string;
  } | null;
  status: "pending" | "approved" | "rejected";
  requestedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
};

type HintRequestsResponse = {
  requests: HintRequest[];
};

const ManageHintRequests = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");

  const { data, isLoading, refetch } = useQuery<HintRequestsResponse>({
    queryKey: ["hint-requests", statusFilter],
    queryFn: async () => {
      const params = statusFilter !== "all" ? `?status=${statusFilter}` : "";
      return apiFetch<HintRequestsResponse>(`/hints/requests${params}`);
    },
    refetchInterval: 5000, // Auto-refresh every 5 seconds
  });

  const approveMutation = useMutation({
    mutationFn: async (requestId: string) => {
      return apiFetch(`/hints/requests/${requestId}/approve`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      toast.success("Hint request approved");
      queryClient.invalidateQueries({ queryKey: ["hint-requests"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to approve hint request");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (requestId: string) => {
      return apiFetch(`/hints/requests/${requestId}/reject`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      toast.success("Hint request rejected");
      queryClient.invalidateQueries({ queryKey: ["hint-requests"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to reject hint request");
    },
  });

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    toast.success("Logged out");
    navigate("/admin/login");
  };

  const requests = data?.requests ?? [];
  const pendingRequests = requests.filter((r) => r.status === "pending");
  const approvedRequests = requests.filter((r) => r.status === "approved");
  const rejectedRequests = requests.filter((r) => r.status === "rejected");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-yellow-500 text-white">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case "approved":
        return (
          <Badge className="bg-green-500 text-white">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-500 text-white">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen gradient-surface">
      <div className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold">Manage Hint Requests</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/admin">
              <Button variant="outline" size="sm">
                <Home className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">Hint Requests</h2>
            <p className="text-sm text-muted-foreground">
              Review and approve/reject hint requests from teams
            </p>
          </div>
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-4">
            <TabsTrigger value="pending">
              Pending ({pendingRequests.length})
            </TabsTrigger>
            <TabsTrigger value="approved">
              Approved ({approvedRequests.length})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rejected ({rejectedRequests.length})
            </TabsTrigger>
            <TabsTrigger value="all">
              All ({requests.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-6">
            {isLoading ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">Loading...</p>
              </Card>
            ) : pendingRequests.length === 0 ? (
              <Card className="p-8 text-center">
                <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No pending hint requests</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {pendingRequests.map((request) => (
                  <Card key={request.id} className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{request.team.name}</h3>
                          {getStatusBadge(request.status)}
                          <Badge variant="outline">Round {request.roundNumber}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {request.team.email}
                        </p>
                        {request.assignment && (
                          <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                            <p className="text-sm font-medium mb-1">Clue:</p>
                            <p className="text-sm">{request.assignment.clueText}</p>
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground mt-3">
                          Requested: {new Date(request.requestedAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => approveMutation.mutate(request.id)}
                          disabled={approveMutation.isPending || rejectMutation.isPending}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => rejectMutation.mutate(request.id)}
                          disabled={approveMutation.isPending || rejectMutation.isPending}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="approved" className="mt-6">
            {isLoading ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">Loading...</p>
              </Card>
            ) : approvedRequests.length === 0 ? (
              <Card className="p-8 text-center">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No approved hint requests</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {approvedRequests.map((request) => (
                  <Card key={request.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{request.team.name}</h3>
                          {getStatusBadge(request.status)}
                          <Badge variant="outline">Round {request.roundNumber}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {request.team.email}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Approved: {request.reviewedAt ? new Date(request.reviewedAt).toLocaleString() : "N/A"}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="rejected" className="mt-6">
            {isLoading ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">Loading...</p>
              </Card>
            ) : rejectedRequests.length === 0 ? (
              <Card className="p-8 text-center">
                <XCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No rejected hint requests</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {rejectedRequests.map((request) => (
                  <Card key={request.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{request.team.name}</h3>
                          {getStatusBadge(request.status)}
                          <Badge variant="outline">Round {request.roundNumber}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {request.team.email}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Rejected: {request.reviewedAt ? new Date(request.reviewedAt).toLocaleString() : "N/A"}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="all" className="mt-6">
            {isLoading ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">Loading...</p>
              </Card>
            ) : requests.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No hint requests</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {requests.map((request) => (
                  <Card key={request.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{request.team.name}</h3>
                          {getStatusBadge(request.status)}
                          <Badge variant="outline">Round {request.roundNumber}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {request.team.email}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Requested: {new Date(request.requestedAt).toLocaleString()}
                          {request.reviewedAt && (
                            <> • Reviewed: {new Date(request.reviewedAt).toLocaleString()}</>
                          )}
                        </p>
                      </div>
                      {request.status === "pending" && (
                        <div className="flex gap-2 ml-4">
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => approveMutation.mutate(request.id)}
                            disabled={approveMutation.isPending || rejectMutation.isPending}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => rejectMutation.mutate(request.id)}
                            disabled={approveMutation.isPending || rejectMutation.isPending}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ManageHintRequests;

