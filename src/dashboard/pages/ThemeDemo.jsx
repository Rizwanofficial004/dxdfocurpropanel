import React from 'react';
import styled from 'styled-components';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Container, Card, CardBody, Grid, Heading, Typography, Button, FlexContainer } from '../styles/commonStyles';
import { useTheme } from '../context/ThemeContext';

const DemoContainer = styled.div`
  background: ${props => props.theme.colors.background};
  min-height: 100vh;
  padding: ${props => props.theme.spacing.lg} 0;
`;

const ColorPalette = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: ${props => props.theme.spacing.sm};
  margin: ${props => props.theme.spacing.md} 0;
`;

const ColorSwatch = styled.div`
  background: ${props => props.color};
  height: 80px;
  border-radius: ${props => props.theme.borderRadius.md};
  border: 1px solid ${props => props.theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.textColor || props.theme.colors.text.primary};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

const ComponentShowcase = styled(Grid)`
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  margin-top: ${props => props.theme.spacing.xl};
`;

const ThemeDemo = () => {
  const { isDarkMode, theme } = useTheme();

  const colorSwatches = [
    { name: 'Primary', color: theme.colors.primary, textColor: 'white' },
    { name: 'Secondary', color: theme.colors.secondary, textColor: 'white' },
    { name: 'Success', color: theme.colors.success, textColor: 'white' },
    { name: 'Warning', color: theme.colors.warning, textColor: 'white' },
    { name: 'Error', color: theme.colors.error, textColor: 'white' },
    { name: 'Background', color: theme.colors.background },
    { name: 'Surface', color: theme.colors.surface },
    { name: 'Border', color: theme.colors.border }
  ];

  return (
    <DashboardLayout>
      <DemoContainer>
        <Container>
          <Heading level="h1">
            {isDarkMode ? '🌙 Dark Mode' : '☀️ Light Mode'} Theme Demo
          </Heading>
          <Typography color="secondary" size="lg">
            This page demonstrates the theming system with dark and light mode support.
          </Typography>

          <Card style={{ marginTop: theme.spacing.xl }}>
            <CardBody>
              <Heading level="h3">Color Palette</Heading>
              <Typography color="secondary">
                Current theme colors in {isDarkMode ? 'dark' : 'light'} mode:
              </Typography>
              <ColorPalette>
                {colorSwatches.map((swatch, index) => (
                  <ColorSwatch 
                    key={index} 
                    color={swatch.color} 
                    textColor={swatch.textColor}
                  >
                    {swatch.name}
                  </ColorSwatch>
                ))}
              </ColorPalette>
            </CardBody>
          </Card>

          <ComponentShowcase>
            <Card>
              <CardBody>
                <Heading level="h4">Typography</Heading>
                <Heading level="h1" margin="0 0 8px 0">Heading 1</Heading>
                <Heading level="h2" margin="0 0 8px 0">Heading 2</Heading>
                <Heading level="h3" margin="0 0 8px 0">Heading 3</Heading>
                <Typography>Regular text content</Typography>
                <Typography color="secondary">Secondary text</Typography>
                <Typography color="light">Light text</Typography>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <Heading level="h4">Buttons</Heading>
                <FlexContainer direction="column" align="flex-start" gap={theme.spacing.sm}>
                  <Button>Primary Button</Button>
                  <Button variant="secondary">Secondary Button</Button>
                  <Button variant="success">Success Button</Button>
                  <Button variant="warning">Warning Button</Button>
                  <Button variant="error">Error Button</Button>
                </FlexContainer>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <Heading level="h4">Cards & Surfaces</Heading>
                <Typography color="secondary">
                  This card demonstrates the surface color and border styling in the current theme.
                </Typography>
                <Card style={{ marginTop: theme.spacing.md, padding: theme.spacing.md }}>
                  <Typography>Nested card example</Typography>
                </Card>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <Heading level="h4">Theme Information</Heading>
                <Typography><strong>Current Mode:</strong> {isDarkMode ? 'Dark' : 'Light'}</Typography>
                <Typography><strong>Background:</strong> {theme.colors.background}</Typography>
                <Typography><strong>Surface:</strong> {theme.colors.surface}</Typography>
                <Typography><strong>Primary:</strong> {theme.colors.primary}</Typography>
                <Typography><strong>Text Primary:</strong> {theme.colors.text.primary}</Typography>
              </CardBody>
            </Card>
          </ComponentShowcase>
        </Container>
      </DemoContainer>
    </DashboardLayout>
  );
};

export default ThemeDemo;
