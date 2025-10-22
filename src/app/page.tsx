'use client';

import React from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  AppBar,
  Toolbar,
  IconButton,
  Paper,
} from '@mui/material';
import {
  PlayArrow,
  Settings,
  CloudUpload,
  Dashboard,
  GitHub,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { ReactFlow, Background, Controls, MiniMap, Node, Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// Sample nodes and edges for the flow
const initialNodes: Node[] = [
  {
    id: '1',
    type: 'input',
    data: { label: 'Source Code' },
    position: { x: 100, y: 100 },
  },
  {
    id: '2',
    data: { label: 'Build Process' },
    position: { x: 300, y: 100 },
  },
  {
    id: '3',
    data: { label: 'Test Suite' },
    position: { x: 500, y: 100 },
  },
  {
    id: '4',
    type: 'output',
    data: { label: 'Deploy' },
    position: { x: 700, y: 100 },
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2' },
  { id: 'e2-3', source: '2', target: '3' },
  { id: 'e3-4', source: '3', target: '4' },
];

export default function Home() {
  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh' }}>
      {/* App Bar */}
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Deployer
          </Typography>
          <Button color="inherit" startIcon={<GitHub />}>
            GitHub
          </Button>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {/* Hero Section */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h1" component="h1" gutterBottom>
            Modern Deployment Platform
          </Typography>
          <Typography variant="h5" color="text.secondary" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
            Build, test, and deploy your applications with our intuitive node-based workflow editor
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<PlayArrow />}
              sx={{ px: 4, py: 1.5 }}
            >
              Get Started
            </Button>
            <Button
              variant="outlined"
              size="large"
              startIcon={<Settings />}
              sx={{ px: 4, py: 1.5 }}
            >
              Learn More
            </Button>
          </Box>
        </Box>

        {/* Features Grid */}
        <Grid container spacing={4} sx={{ mb: 6 }}>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <CloudUpload sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" component="h3" gutterBottom>
                  Easy Deployment
                </Typography>
                <Typography color="text.secondary">
                  Deploy your applications with just a few clicks using our intuitive interface
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Dashboard sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" component="h3" gutterBottom>
                  Visual Workflows
                </Typography>
                <Typography color="text.secondary">
                  Create and manage complex deployment pipelines with our node-based editor
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Settings sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" component="h3" gutterBottom>
                  Advanced Configuration
                </Typography>
                <Typography color="text.secondary">
                  Fine-tune your deployment settings with powerful configuration options
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* React Flow Demo */}
        <Paper sx={{ height: 500, mb: 4 }}>
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="h6">Deployment Workflow</Typography>
          </Box>
          <Box sx={{ height: 'calc(100% - 64px)' }}>
            <ReactFlow
              nodes={initialNodes}
              edges={initialEdges}
              fitView
            >
              <Background />
              <Controls />
              <MiniMap />
            </ReactFlow>
          </Box>
        </Paper>

        {/* CTA Section */}
        <Box sx={{ textAlign: 'center', py: 6, bgcolor: 'grey.50', borderRadius: 2 }}>
          <Typography variant="h4" component="h2" gutterBottom>
            Ready to get started?
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Join thousands of developers who trust our platform for their deployment needs
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<CloudUpload />}
            sx={{ px: 4, py: 1.5 }}
          >
            Start Deploying Now
          </Button>
        </Box>
      </Container>
    </Box>
  );
}