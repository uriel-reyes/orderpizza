"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var material_1 = require("@mui/material");
var styles_1 = require("@mui/material/styles");
var commercetools_1 = require("./api/commercetools");
var ProductDetail_1 = require("./components/ProductDetail");
var ShoppingBag_1 = require("@mui/icons-material/ShoppingBag");
var Search_1 = require("@mui/icons-material/Search");
// Create a theme
var theme = (0, styles_1.createTheme)({
    palette: {
        primary: {
            main: '#1976d2',
        },
        secondary: {
            main: '#dc004e',
        },
    },
    typography: {
        fontFamily: [
            'Roboto',
            '"Helvetica Neue"',
            'Arial',
            'sans-serif'
        ].join(','),
    },
});
function App() {
    var _a = (0, react_1.useState)(null), product = _a[0], setProduct = _a[1];
    var _b = (0, react_1.useState)(true), loading = _b[0], setLoading = _b[1];
    var _c = (0, react_1.useState)(null), error = _c[0], setError = _c[1];
    var _d = (0, react_1.useState)(commercetools_1.DEFAULT_PRODUCT_ID), productId = _d[0], setProductId = _d[1];
    var _e = (0, react_1.useState)(commercetools_1.DEFAULT_PRODUCT_ID), inputProductId = _e[0], setInputProductId = _e[1];
    // Fetch product data on component mount or when productId changes
    (0, react_1.useEffect)(function () {
        function loadProduct() {
            return __awaiter(this, void 0, void 0, function () {
                var data, err_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            setLoading(true);
                            setError(null);
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, 4, 5]);
                            return [4 /*yield*/, (0, commercetools_1.fetchProductById)(productId)];
                        case 2:
                            data = _a.sent();
                            setProduct(data);
                            return [3 /*break*/, 5];
                        case 3:
                            err_1 = _a.sent();
                            setError(err_1 instanceof Error ? err_1.message : 'An unknown error occurred');
                            setProduct(null);
                            return [3 /*break*/, 5];
                        case 4:
                            setLoading(false);
                            return [7 /*endfinally*/];
                        case 5: return [2 /*return*/];
                    }
                });
            });
        }
        loadProduct();
    }, [productId]);
    // Handle product ID search form submission
    var handleSearchSubmit = function (e) {
        e.preventDefault();
        setProductId(inputProductId);
    };
    return (<styles_1.ThemeProvider theme={theme}>
      <material_1.CssBaseline />
      <material_1.Box sx={{ flexGrow: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <material_1.AppBar position="static">
          <material_1.Toolbar>
            <ShoppingBag_1.default sx={{ mr: 2 }}/>
            <material_1.Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Commercetools Product Viewer
            </material_1.Typography>
            <material_1.Link color="inherit" href="https://docs.commercetools.com" target="_blank" rel="noopener" sx={{ ml: 2 }}>
              API Docs
            </material_1.Link>
          </material_1.Toolbar>
        </material_1.AppBar>
        
        <material_1.Container maxWidth="lg" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
          {/* Search Form */}
          <material_1.Paper component="form" onSubmit={handleSearchSubmit} sx={{ p: 2, mb: 4, display: 'flex', alignItems: 'center' }} elevation={2}>
            <material_1.TextField label="Product ID" variant="outlined" fullWidth value={inputProductId} onChange={function (e) { return setInputProductId(e.target.value); }} size="small" sx={{ mr: 2 }}/>
            <material_1.Button type="submit" variant="contained" startIcon={<Search_1.default />} disabled={!inputProductId || inputProductId === productId}>
              Search
            </material_1.Button>
          </material_1.Paper>
          
          {/* Product Detail Component */}
          <ProductDetail_1.default product={product} loading={loading} error={error}/>
        </material_1.Container>
        
        <material_1.Box component="footer" sx={{ py: 3, px: 2, mt: 'auto', backgroundColor: function (theme) { return theme.palette.grey[100]; } }}>
          <material_1.Container maxWidth="lg">
            <material_1.Typography variant="body2" color="text.secondary" align="center">
              {'© '}
              {new Date().getFullYear()}
              {' Commercetools Product Viewer'}
            </material_1.Typography>
          </material_1.Container>
        </material_1.Box>
      </material_1.Box>
    </styles_1.ThemeProvider>);
}
exports.default = App;
