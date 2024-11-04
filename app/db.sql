-- User Table
CREATE TABLE IF NOT EXISTS User (
    UserID INTEGER PRIMARY KEY,
    UserType TEXT NOT NULL CHECK(UserType IN ('Customer', 'Admin', 'Guest'))
);

-- Customer Table
CREATE TABLE IF NOT EXISTS Customer (
    UserID INTEGER PRIMARY KEY,
    Name TEXT NOT NULL,
    Email TEXT NOT NULL UNIQUE,
    Password TEXT NOT NULL,
    Phone TEXT,
    Address TEXT,
    MembershipTier TEXT NOT NULL CHECK(MembershipTier IN ('Normal', 'Premium', 'Gold')),
    FOREIGN KEY (UserID) REFERENCES User(UserID)
);

-- Administrator Table
CREATE TABLE IF NOT EXISTS Administrator (
    UserID INTEGER PRIMARY KEY,
    Name TEXT NOT NULL,
    Email TEXT NOT NULL UNIQUE,
    Password TEXT NOT NULL,
    Role TEXT NOT NULL,
    FOREIGN KEY (UserID) REFERENCES User(UserID)
);

-- Guest Table
CREATE TABLE IF NOT EXISTS Guest (
    UserID INTEGER PRIMARY KEY,
    GuestID TEXT,
    FOREIGN KEY (UserID) REFERENCES User(UserID)
);

-- Category Table
CREATE TABLE IF NOT EXISTS Category (
    CategoryID INTEGER PRIMARY KEY,
    Name TEXT NOT NULL
);

-- SubCategory Table
CREATE TABLE IF NOT EXISTS SubCategory (
    SubCategoryID INTEGER PRIMARY KEY,
    Name TEXT NOT NULL,
    CategoryID INTEGER,
    FOREIGN KEY (CategoryID) REFERENCES Category(CategoryID)
);

-- Product Table
CREATE TABLE IF NOT EXISTS Product (
    ProductID INTEGER PRIMARY KEY,
    Name TEXT NOT NULL,
    Description TEXT,
    Price REAL NOT NULL,
    Size TEXT,
    Color TEXT,
    Material TEXT,
    StockQuantity INTEGER NOT NULL,
    CategoryID INTEGER,
    SubCategoryID INTEGER,
    Featured BOOLEAN DEFAULT 0, -- For featured products on homepage
    FOREIGN KEY (CategoryID) REFERENCES Category(CategoryID),
    FOREIGN KEY (SubCategoryID) REFERENCES SubCategory(SubCategoryID)
);

-- Product_Image Table (optional, for storing multiple images per product)
CREATE TABLE IF NOT EXISTS Product_Image (
    ImageID INTEGER PRIMARY KEY,
    ProductID INTEGER,
    ImageURL TEXT NOT NULL,
    FOREIGN KEY (ProductID) REFERENCES Product(ProductID)
);

-- Warranty Table for tracking product warranties
CREATE TABLE IF NOT EXISTS Warranty (
    WarrantyID INTEGER PRIMARY KEY,
    ProductID INTEGER,
    WarrantyDuration TEXT, -- e.g., "1 year", "2 years"
    FOREIGN KEY (ProductID) REFERENCES Product(ProductID)
);

CREATE TABLE IF NOT EXISTS "Order" (
    OrderID INTEGER PRIMARY KEY,
    OrderDate TEXT NOT NULL, -- Store dates in ISO format (YYYY-MM-DD)
    Status TEXT NOT NULL CHECK(Status IN ('Pending', 'Shipped', 'Delivered')),
    TotalAmount REAL NOT NULL,
    UserID INTEGER,
    FOREIGN KEY (UserID) REFERENCES User(UserID)
);

-- Order_Product Table (Join Table for Order and Product)
CREATE TABLE IF NOT EXISTS Order_Product (
    OrderID INTEGER,
    ProductID INTEGER,
    Quantity INTEGER NOT NULL,
    PRIMARY KEY (OrderID, ProductID),
    FOREIGN KEY (OrderID) REFERENCES "Order"(OrderID),
    FOREIGN KEY (ProductID) REFERENCES Product(ProductID)
);


-- Return Table for managing product returns and refunds
CREATE TABLE IF NOT EXISTS Return (
    ReturnID INTEGER PRIMARY KEY,
    OrderID INTEGER,
    ReturnDate TEXT NOT NULL, -- Store dates in ISO format (YYYY-MM-DD)
    Reason TEXT,
    Status TEXT NOT NULL,
    FOREIGN KEY (OrderID) REFERENCES "Order"(OrderID)
);

-- Review Table
CREATE TABLE IF NOT EXISTS Review (
    ReviewID INTEGER PRIMARY KEY,
    Rating INTEGER CHECK(Rating BETWEEN 1 AND 5),
    Comment TEXT,
    Date TEXT NOT NULL, -- Store dates in ISO format (YYYY-MM-DD)
    ProductID INTEGER,
    UserID INTEGER,
    FOREIGN KEY (ProductID) REFERENCES Product(ProductID),
    FOREIGN KEY (UserID) REFERENCES User(UserID)
);

-- LoyaltyProgram Table
CREATE TABLE IF NOT EXISTS LoyaltyProgram (
    ProgramID INTEGER PRIMARY KEY,
    Name TEXT NOT NULL,
    DiscountRate REAL NOT NULL,
    Benefits TEXT
);

-- Customer_LoyaltyProgram (Join Table for Customer and LoyaltyProgram)
CREATE TABLE IF NOT EXISTS Customer_LoyaltyProgram (
    CustomerID INTEGER,
    ProgramID INTEGER,
    PRIMARY KEY (CustomerID, ProgramID),
    FOREIGN KEY (CustomerID) REFERENCES Customer(UserID),
    FOREIGN KEY (ProgramID) REFERENCES LoyaltyProgram(ProgramID)
);

-- DeliveryDetail Table
CREATE TABLE IF NOT EXISTS DeliveryDetail (
    DeliveryID INTEGER PRIMARY KEY,
    Type TEXT NOT NULL CHECK(Type IN ('Standard', 'Express')),
    Status TEXT NOT NULL CHECK(Status IN ('In Progress', 'Delivered')),
    OrderID INTEGER,
    Address TEXT NOT NULL,
    DeliveryDate TEXT, -- Store dates in ISO format (YYYY-MM-DD)
    FOREIGN KEY (OrderID) REFERENCES "Order"(OrderID)
);

-- Cart Table for handling guest and customer shopping carts
CREATE TABLE IF NOT EXISTS Cart (
    CartID INTEGER PRIMARY KEY,
    UserID INTEGER,
    SessionID TEXT,
    FOREIGN KEY (UserID) REFERENCES User(UserID)
);

-- Cart_Product Table for products in the cart
CREATE TABLE IF NOT EXISTS Cart_Product (
    CartID INTEGER,
    ProductID INTEGER,
    Quantity INTEGER NOT NULL,
    PRIMARY KEY (CartID, ProductID),
    FOREIGN KEY (CartID) REFERENCES Cart(CartID),
    FOREIGN KEY (ProductID) REFERENCES Product(ProductID)
);

-- Payment Table for tracking payment methods and status
CREATE TABLE IF NOT EXISTS Payment (
    PaymentID INTEGER PRIMARY KEY,
    OrderID INTEGER,
    PaymentMethod TEXT NOT NULL,
    PaymentStatus TEXT NOT NULL,
    FOREIGN KEY (OrderID) REFERENCES "Order"(OrderID)
);

-- Wishlist Table for customer wishlists
CREATE TABLE IF NOT EXISTS Wishlist (
    WishlistID INTEGER PRIMARY KEY,
    UserID INTEGER,
    ProductID INTEGER,
    FOREIGN KEY (UserID) REFERENCES User(UserID),
    FOREIGN KEY (ProductID) REFERENCES Product(ProductID)
);

-- Support_Ticket Table for tracking customer support requests
CREATE TABLE IF NOT EXISTS Support_Ticket (
    TicketID INTEGER PRIMARY KEY,
    UserID INTEGER,
    Issue TEXT NOT NULL,
    Status TEXT NOT NULL,
    CreatedDate TEXT NOT NULL, -- Store dates in ISO format (YYYY-MM-DD)
    FOREIGN KEY (UserID) REFERENCES User(UserID)
);

-- Activity_Log Table for tracking admin actions
CREATE TABLE IF NOT EXISTS Activity_Log (
    LogID INTEGER PRIMARY KEY,
    AdminID INTEGER,
    Action TEXT NOT NULL,
    Timestamp TEXT NOT NULL, -- Store timestamps in ISO format
    FOREIGN KEY (AdminID) REFERENCES Administrator(UserID)
);

-- Inventory_Log Table for tracking stock changes
CREATE TABLE IF NOT EXISTS Inventory_Log (
    LogID INTEGER PRIMARY KEY,
    ProductID INTEGER,
    ChangeAmount INTEGER NOT NULL,
    ChangeType TEXT NOT NULL, -- e.g., 'Restock', 'Sale'
    Timestamp TEXT NOT NULL, -- Store timestamps in ISO format
    FOREIGN KEY (ProductID) REFERENCES Product(ProductID)
);

-- Warehouse Table for tracking multiple storage locations
CREATE TABLE IF NOT EXISTS Warehouse (
    WarehouseID INTEGER PRIMARY KEY,
    Location TEXT NOT NULL
);
