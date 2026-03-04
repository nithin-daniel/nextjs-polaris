export default function ProductExtensionsDemo() {

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Product Extensions Demo</h1>
      
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-4">Extended Product Fields</h2>
        <p className="text-sm text-gray-600 mb-4">
          This demonstrates how we've extended the basic FakeStore API Product interface 
          with UI-only fields for demo purposes.
        </p>
        
        <p className="text-sm text-blue-600">
          Visit <a href="/products/table" className="underline">/products/table</a> to see the table view with status filtering.
        </p>
      </div>
      
      <div className="mt-8 bg-blue-50 p-4 rounded-lg">
        <h3 className="font-medium mb-2">Implementation Notes</h3>
        <ul className="text-sm space-y-1 text-gray-700">
          <li>• <code>ApiProduct</code> interface matches the original FakeStore API response</li>
          <li>• <code>Product</code> interface extends with UI-only fields for demo purposes</li>
          <li>• <code>enrichProductWithMockData()</code> function adds mock values deterministically</li>
          <li>• <code>filterProducts()</code> utility enables client-side filtering</li>
          <li>• All mock data is generated consistently using seeded randomization</li>
        </ul>
      </div>
    </div>
  );
}