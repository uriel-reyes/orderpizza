"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var material_1 = require("@mui/material");
var ProductDetail = function (_a) {
    var product = _a.product, loading = _a.loading, error = _a.error;
    if (loading) {
        return (<material_1.Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <material_1.CircularProgress />
      </material_1.Box>);
    }
    if (error) {
        return (<material_1.Box my={4}>
        <material_1.Alert severity="error">{error}</material_1.Alert>
      </material_1.Box>);
    }
    if (!product) {
        return (<material_1.Box my={4}>
        <material_1.Alert severity="info">No product data available</material_1.Alert>
      </material_1.Box>);
    }
    var masterData = product.masterData;
    var masterVariant = masterData.current.masterVariant;
    return (<material_1.Box>
      <material_1.Card elevation={3}>
        <material_1.CardContent>
          <material_1.Typography variant="h4" gutterBottom>
            {masterData.current.name || masterVariant.key || "Unlabeled Product"}
          </material_1.Typography>
          
          <material_1.Divider sx={{ mb: 2 }}/>
          
          <material_1.Grid container spacing={4}>
            {/* Product Images */}
            <material_1.Grid item xs={12} md={6}>
              <material_1.Paper elevation={2} sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                {masterVariant.images && masterVariant.images.length > 0 ? (<material_1.Box component="img" src={masterVariant.images[0].url} alt={masterVariant.images[0].label || masterVariant.key || "Product image"} sx={{ maxWidth: '100%', maxHeight: 400, objectFit: 'contain', mb: 2 }}/>) : (<material_1.Box sx={{
                bgcolor: 'grey.200',
                height: 300,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2
            }}>
                    <material_1.Typography variant="body2" color="textSecondary">No image available</material_1.Typography>
                  </material_1.Box>)}
              </material_1.Paper>
            </material_1.Grid>
            
            {/* Product Details */}
            <material_1.Grid item xs={12} md={6}>
              <material_1.Stack spacing={3}>
                {/* Basic Details */}
                <material_1.Paper elevation={2} sx={{ p: 2 }}>
                  <material_1.Typography variant="h6" gutterBottom>Product Details</material_1.Typography>
                  <material_1.List dense>
                    <material_1.ListItem>
                      <material_1.ListItemText primary="Product ID" secondary={product.id} primaryTypographyProps={{ variant: 'subtitle2' }}/>
                    </material_1.ListItem>
                    <material_1.ListItem>
                      <material_1.ListItemText primary="SKU" secondary={masterVariant.sku || 'N/A'} primaryTypographyProps={{ variant: 'subtitle2' }}/>
                    </material_1.ListItem>
                    <material_1.ListItem>
                      <material_1.ListItemText primary="Key" secondary={product.key || 'N/A'} primaryTypographyProps={{ variant: 'subtitle2' }}/>
                    </material_1.ListItem>
                    <material_1.ListItem>
                      <material_1.ListItemText primary="Version" secondary={product.version} primaryTypographyProps={{ variant: 'subtitle2' }}/>
                    </material_1.ListItem>
                  </material_1.List>
                </material_1.Paper>
                
                {/* Categories */}
                <material_1.Paper elevation={2} sx={{ p: 2 }}>
                  <material_1.Typography variant="h6" gutterBottom>Categories</material_1.Typography>
                  <material_1.Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {masterData.current.categories && masterData.current.categories.length > 0 ? (masterData.current.categories.map(function (category, index) { return (<material_1.Chip key={index} label={category.name || category.id} size="small" color="primary" variant="outlined"/>); })) : (<material_1.Typography variant="body2" color="textSecondary">No categories assigned</material_1.Typography>)}
                  </material_1.Box>
                </material_1.Paper>
                
                {/* Description */}
                <material_1.Paper elevation={2} sx={{ p: 2 }}>
                  <material_1.Typography variant="h6" gutterBottom>Description</material_1.Typography>
                  <material_1.Typography variant="body2">
                    {masterData.current.description || 'No description available'}
                  </material_1.Typography>
                </material_1.Paper>
              </material_1.Stack>
            </material_1.Grid>
          </material_1.Grid>
          
          {/* Price Table */}
          <material_1.Box mt={4}>
            <material_1.Typography variant="h6" gutterBottom>Pricing</material_1.Typography>
            <material_1.TableContainer component={material_1.Paper}>
              <material_1.Table size="small">
                <material_1.TableHead>
                  <material_1.TableRow>
                    <material_1.TableCell>Price ID</material_1.TableCell>
                    <material_1.TableCell align="right">Amount</material_1.TableCell>
                    <material_1.TableCell align="right">Currency</material_1.TableCell>
                    <material_1.TableCell align="right">Country</material_1.TableCell>
                    <material_1.TableCell align="right">Valid From</material_1.TableCell>
                    <material_1.TableCell align="right">Valid Until</material_1.TableCell>
                  </material_1.TableRow>
                </material_1.TableHead>
                <material_1.TableBody>
                  {masterVariant.prices && masterVariant.prices.length > 0 ? (masterVariant.prices.map(function (price, index) { return (<material_1.TableRow key={index}>
                        <material_1.TableCell component="th" scope="row">
                          {price.id.substring(0, 8)}...
                        </material_1.TableCell>
                        <material_1.TableCell align="right">
                          {(price.value.centAmount / 100).toFixed(2)}
                        </material_1.TableCell>
                        <material_1.TableCell align="right">{price.value.currencyCode}</material_1.TableCell>
                        <material_1.TableCell align="right">{price.country || 'All'}</material_1.TableCell>
                        <material_1.TableCell align="right">{price.validFrom || '-'}</material_1.TableCell>
                        <material_1.TableCell align="right">{price.validUntil || '-'}</material_1.TableCell>
                      </material_1.TableRow>); })) : (<material_1.TableRow>
                      <material_1.TableCell colSpan={6} align="center">No pricing information available</material_1.TableCell>
                    </material_1.TableRow>)}
                </material_1.TableBody>
              </material_1.Table>
            </material_1.TableContainer>
          </material_1.Box>
          
          {/* Attributes */}
          {masterVariant.attributesRaw && masterVariant.attributesRaw.length > 0 && (<material_1.Box mt={4}>
              <material_1.Typography variant="h6" gutterBottom>Attributes</material_1.Typography>
              <material_1.TableContainer component={material_1.Paper}>
                <material_1.Table size="small">
                  <material_1.TableHead>
                    <material_1.TableRow>
                      <material_1.TableCell>Name</material_1.TableCell>
                      <material_1.TableCell>Value</material_1.TableCell>
                    </material_1.TableRow>
                  </material_1.TableHead>
                  <material_1.TableBody>
                    {masterVariant.attributesRaw.map(function (attr, index) { return (<material_1.TableRow key={index}>
                        <material_1.TableCell>{attr.name}</material_1.TableCell>
                        <material_1.TableCell>
                          {typeof attr.value === 'object'
                    ? JSON.stringify(attr.value)
                    : String(attr.value)}
                        </material_1.TableCell>
                      </material_1.TableRow>); })}
                  </material_1.TableBody>
                </material_1.Table>
              </material_1.TableContainer>
            </material_1.Box>)}
        </material_1.CardContent>
      </material_1.Card>
    </material_1.Box>);
};
exports.default = ProductDetail;
